"""
Serverless Implementation of Announcer Service
"""
from flask import Flask, request, jsonify
import redis
from dotenv import load_dotenv
import json
import os
import datetime
import re
import random

r = redis.Redis(host=os.environ.get('KV_ENDPOINT'), 
                port=int(os.environ.get("KV_PORT")), 
                username=os.environ.get('KV_USERNAME'), 
                password=os.environ.get('KV_PASSWORD'), 
                ssl=True)

app = Flask(__name__)
load_dotenv()
master_password = os.environ.get('MASTER_PASSWORD')
allow_public_access = os.environ.get('ALLOW_PUBLIC_ACCESS')

def verify_master_password(master_password: str):
    """
    Verify the master password
    """
    if master_password is None or master_password != master_password:
        return False
    return True

def get_current_time():
    """
    Get the current time in a readable format
    """
    return datetime.datetime.utcnow().isoformat()

"""
Additional Features - Not necessary but fun to have
"""
def replace_random_tag(text):
    """
    Replace all occurrences of <!rX-Y> with a random number between X and Y (inclusive).
    """
    def random_replacement(match):
        range_start, range_end = map(int, match.group(1).split('-'))
        return str(random.randint(range_start, range_end))
    
    # Replace all occurrences of the pattern with a random number in the specified range
    return re.sub(r'<!r(\d+)-(\d+)>', random_replacement, text)

@app.route("/announcement/set", methods=['POST'])
def set_announcement():
    """
    Set a new announcement or update an existing one
    """
    announcement_key = request.json['key']  # Key to reference the announcement by
    announcement_value = request.json['value']  # The initial announcement value
    announcement_secret = request.json['secret']  # Secret to update or delete the announcement
    announcement_public = request.json.get('public', True)  # True/False if you need the secret to view the announcement
    announcement_expiry = request.json.get('expiry')  # Expiry time for the announcement
    master_password = request.json.get('master_password')  # Used only when public access is disabled

    # If public is not allowed to set announcements, check if the master password is correct
    if allow_public_access == 'false' and not verify_master_password(master_password):
        return jsonify({"message": "Invalid master password"}), 401
    
    if announcement_expiry is None:
        announcement_expiry = -1
    
    # Convert the announcement data to a JSON string
    announcement_data = {
        "content": announcement_value,
        "secret": announcement_secret,
        "public": announcement_public,  # Store the public flag
        "created_at": get_current_time(),  # Store the creation time
    }

    if announcement_expiry > 0:
        announcement_data["expires_at"] = (datetime.datetime.utcnow() + datetime.timedelta(seconds=announcement_expiry)).isoformat()
        announcement_data_json = json.dumps(announcement_data)
        r.setex(announcement_key, announcement_expiry, announcement_data_json)
    else:
        announcement_data_json = json.dumps(announcement_data)
        r.set(announcement_key, announcement_data_json)
    
    return jsonify({"message": "Announcement set successfully"}), 200


@app.route("/announcement/get/<announcement_key>", methods=['GET'])
def get_announcement(announcement_key: str):
    """
    Fetch an announcement by its user-defined key
    """
    announcement_data = r.get(announcement_key)
    if announcement_data is None:
        return jsonify({"message": "Announcement not found"}), 404
    
    announcement = json.loads(announcement_data)
    
    # Check if the announcement is public or requires a secret
    if not announcement.get('public', True):
        provided_secret = request.args.get('secret')
        if not provided_secret or provided_secret != announcement['secret']:
            return jsonify({"message": "Secret required or incorrect"}), 403
    
    # Replace the random tag in the announcement content
    announcement['content'] = replace_random_tag(announcement['content'])
    
    # Remove the secret before returning the announcement
    if 'secret' in announcement:
        del announcement['secret']
    
    # Include the TTL (time to live) in the response if applicable
    ttl = r.ttl(announcement_key)
    if ttl > 0:
        announcement['expires_in_seconds'] = ttl
        announcement['expires_at'] = (datetime.datetime.utcnow() + datetime.timedelta(seconds=ttl)).isoformat()

    return jsonify(announcement), 200


@app.route("/announcement/delete", methods=['POST'])
def delete_announcement():
    """
    Delete an announcement
    """
    announcement_key = request.json['key']
    announcement_secret = request.json['secret']
    master_password = request.json.get('master_password')

    # If public is not allowed to delete announcements, check if the master password is correct
    if allow_public_access == 'false' and not verify_master_password(master_password):
        return jsonify({"message": "Invalid master password"}), 401
        
    announcement_data = r.get(announcement_key)
    if announcement_data is None:
        return jsonify({"message": "Announcement not found"}), 404
    
    announcement_data = json.loads(announcement_data)
    if announcement_data['secret'] != announcement_secret:
        return jsonify({"message": "Invalid secret"}), 401
    
    r.delete(announcement_key)
    return jsonify({"message": "Announcement deleted successfully"}), 200

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to Signpost"}), 200

if __name__ == '__main__':
    app.run()


"""
Serverless Implementation of Announcer Service
"""
from flask import Flask, request, jsonify
import redis
from dotenv import load_dotenv
import json
import os

r = redis.Redis(host='localhost', port=6379, db=0)

app = Flask(__name__)
load_dotenv()
master_password = os.getenv('MASTER_PASSWORD')
allow_public_access = os.getenv('ALLOW_PUBLIC_ACCESS')

def verify_master_password(master_password: str):
    """
    Verify the master password
    """
    if master_password is None or master_password != master_password:
        return False
    return True

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
        "public": announcement_public  # Store the public flag
    }
    announcement_data_json = json.dumps(announcement_data)
    
    if announcement_expiry > 0:
        r.setex(announcement_key, announcement_expiry, announcement_data_json)
    else:
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
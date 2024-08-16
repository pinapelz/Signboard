import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [apikey, setApikey] = useState<string>('');
  const [announcementKey, setAnnouncementKey] = useState<string>('');
  const [announcementData, setAnnouncementData] = useState<any>(null);
  const [addModifyMessage, setAddModifyMessage] = useState<string | null>(null);
  const [deletionMessage, setDeletionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<string>('text');
  const [activeTab, setActiveTab] = useState<string>('view');
  const [instancePublic, setInstancePublic] = useState<boolean>(true);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('apikey');
    if (savedApiKey) {
      setApikey(savedApiKey);
      setInputType('password');
    }
  }, []);

  useEffect(() => {
    fetch('/api/public')
      .then(response => response.json())
      .then(data => {
        setInstancePublic(data.public);
      })
      .catch(error => {
        console.error('Error fetching public announcement:', error);
      });
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApikey(e.target.value);
  };

  const handleApiKeyKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      localStorage.setItem('apikey', apikey);
      alert('API Key saved!');
      setInputType('password');
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(`api/announcement/get/${announcementKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'secret': apikey,
          'master_password': (document.getElementById('masterPassword') as HTMLInputElement).value,
        },
      });

      if (!response.ok) {
        throw new Error('Announcement not found or incorrect key');
      }

      const data = await response.json();
      setAnnouncementData(data);
      setError(null);
    } catch (err: any) {
      setAnnouncementData(null);
      setError(err.message);
    }
  };

  const addAnnouncement = async (key: string, content: string, secret: string, pub: boolean, expiresAt: string, masterPass: string) => {
    const secondsUntilExpiry = Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / 1000);
    try {
      const response = await fetch(`/api/announcement/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key, value: content, secret: secret, expires_at: secondsUntilExpiry, public: pub, master_password: masterPass }),
      });
      if (!response.ok) {
        setAddModifyMessage('Failed to add announcement');
      }
      setAddModifyMessage('Announcement set/modified successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteAnnouncement = async (key: string) => {
    try {
      const response = await fetch(`/api/announcement/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key, secret: apikey, master_password: (document.getElementById('masterPassword') as HTMLInputElement).value }),
      });

      if (!response.ok) {
        setDeletionMessage('Failed to delete announcement');
        throw new Error('Failed to delete announcement');
      }
      alert('Announcement deleted successfully!');
      setDeletionMessage('Announcement deleted successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Signpost</h1>
        <p>A simple tool for managing announcements in your Discord server. It's easy to use and free!</p>
        <img src="https://files.catbox.moe/y0nnkz.png" alt="Signpost Minecraft"></img>
      </header>
      <main>
        <div className="section">
          <p>Enter the secret you used when setting announcements. We'll remember it for next time too!</p>
          <input
            type={inputType}
            placeholder="API Key - Press Enter after input to save in browser"
            value={apikey}
            onChange={handleApiKeyChange}
            onKeyPress={handleApiKeyKeyPress}
          />
          <input
              type="password"
              placeholder="Master Password - Use only if instance is private"
              id="masterPassword"
              defaultValue=""
              style={{ display: instancePublic ? 'none' : 'block' }}
            />
        </div>
        <div className="tabs">
          <button
            className={activeTab === 'view' ? 'active' : ''}
            onClick={() => setActiveTab('view')}
          >
            View
          </button>
          <button
            className={activeTab === 'add' ? 'active' : ''}
            onClick={() => setActiveTab('add')}
          >
            Add/Modify
          </button>
          <button
            className={activeTab === 'delete' ? 'active' : ''}
            onClick={() => setActiveTab('delete')}
          >
            Delete
          </button>
        </div>
        {activeTab === 'view' && (
          <div className="section">
            <h2>View Announcements</h2>
            <input
              type="text"
              placeholder="Enter Announcement Key"
              value={announcementKey}
              onChange={(e) => setAnnouncementKey(e.target.value)}
            />
            <button onClick={fetchAnnouncement}>Fetch Announcement</button>

            {error && <p className="error">{error}</p>}
            {announcementData && (
              <div className="announcement">
                <h3>Announcement Content:</h3>
                <p>{announcementData.content}</p>
                {announcementData.expires_at && (
                  <p>
                    <strong>Expires at:</strong> {announcementData.expires_at}
                  </p>
                )}
                {announcementData.created_at && (
                  <p>
                    <strong>Created/Modified at:</strong> {announcementData.created_at}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'add' && (
          <div className="section">
            <h2>Add Announcement</h2>
            <p>Set an empty date/time for no expiry!</p>
            <input
              type="text"
              placeholder="Keyword - Term to get the announcement later"
              id="announcementSetKey"
            />
            <input
              type="text"
              placeholder="Announcement Content"
              id="announcementContent"
            />
            <input
              type="datetime-local"
              placeholder="Expiration Date"
              id="announcementExpiresAt"
            />
            <input
              type="text"
              placeholder="Key/Secret - Secret that is used to modify/add"
              id="announcementSetSecret"
            />
            <label>
              Public
              <input
                type="checkbox"
                id="announcementPublicCheckbox"
                defaultChecked
              />
            </label>
            <button
              onClick={() => {
                const key = (document.getElementById('announcementSetKey') as HTMLInputElement).value;
                const content = (document.getElementById('announcementContent') as HTMLInputElement).value;
                const expiresAt = (document.getElementById('announcementExpiresAt') as HTMLInputElement).value;
                const secret = (document.getElementById('announcementSetSecret') as HTMLInputElement).value;
                const pub = (document.getElementById('announcementPublicCheckbox') as HTMLInputElement).checked;
                const masterPass = (document.getElementById('announcementSetMasterPass') as HTMLInputElement).value;
                addAnnouncement(key, content, secret, pub, expiresAt, masterPass);
              }}
            >
              Add/Modify
            </button>
            {addModifyMessage && <p>{addModifyMessage}</p>}
          </div>
        )}
        {activeTab === 'delete' && (
          <div className="section">
            <h2>Delete Announcement</h2>
            <p>The key you've inputted above will be what we use to authorize the deletion!</p>
            <input
              type="text"
              placeholder="Enter Announcement Key"
              id="deleteAnnouncementKey"
            />
            <button
              onClick={() => {
                const key = (document.getElementById('deleteAnnouncementKey') as HTMLInputElement).value;
                deleteAnnouncement(key);
              }}
            >
              Delete Announcement
            </button>
            {deletionMessage && <p>{
              deletionMessage
            }</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
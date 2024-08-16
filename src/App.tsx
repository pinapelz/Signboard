import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [apikey, setApikey] = useState<string>('');
  const [announcementKey, setAnnouncementKey] = useState<string>('');
  const [announcementData, setAnnouncementData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<string>('text');
  const [activeTab, setActiveTab] = useState<string>('view');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('apikey');
    if (savedApiKey) {
      setApikey(savedApiKey);
      setInputType('password');
    }
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
      const response = await fetch(`http://localhost:5000/announcement/get/${announcementKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

  const addAnnouncement = async (content: string, expiresAt: string) => {
    try {
      const response = await fetch(`http://localhost:5000/announcement/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, expires_at: expiresAt, apikey }),
      });

      if (!response.ok) {
        throw new Error('Failed to add announcement');
      }

      alert('Announcement added successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteAnnouncement = async (key: string) => {
    try {
      const response = await fetch(`/announcement/delete/${key}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apikey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }

      alert('Announcement deleted successfully!');
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
        </div>
        <div className="tabs">
          <button onClick={() => setActiveTab('view')}>View Announcements</button>
          <button onClick={() => setActiveTab('add')}>Add Announcement</button>
          <button onClick={() => setActiveTab('delete')}>Delete Announcement</button>
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
            <p>This is a stub for now and doesn't actually work!</p>
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
            <button
              onClick={() => {
                const content = (document.getElementById('announcementContent') as HTMLInputElement).value;
                const expiresAt = (document.getElementById('announcementExpiresAt') as HTMLInputElement).value;
                addAnnouncement(content, expiresAt);
              }}
            >
              Add Announcement
            </button>
          </div>
        )}
        {activeTab === 'delete' && (
          <div className="section">
            <h2>Delete Announcement</h2>
            <p>This is a stub for now and doesn't actually work!</p>
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
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
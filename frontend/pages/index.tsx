import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LunaAssistant() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [allModes, setAllModes] = useState<any[]>([]);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentMode, setCurrentMode] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available modes on mount
  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/modes`);
        setAllModes(response.data.modes);
      } catch (error) {
        console.error('Error fetching modes:', error);
      }
    };
    fetchModes();
  }, []);

  // Handle user registration
  const handleRegister = async () => {
    if (!userName.trim() || selectedModes.length === 0) {
      alert('Bitte gib einen Namen ein und wähle mindestens einen Modus!');
      return;
    }

    const newUserId = `user_${Date.now()}`;

    try {
      const response = await axios.post(`${API_URL}/api/user/profile`, {
        user_id: newUserId,
        name: userName,
        modes: selectedModes
      });

      setUserId(newUserId);
      setUserLoggedIn(true);
      setMessages([{ role: 'luna', text: response.data.message, timestamp: new Date() }]);
      setCurrentMode(selectedModes[0]); // Select first mode by default
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Fehler bei der Registrierung!');
    }
  };

  // Handle mode toggle
  const toggleMode = (modeId: string) => {
    if (selectedModes.includes(modeId)) {
      setSelectedModes(selectedModes.filter(m => m !== modeId));
    } else {
      setSelectedModes([...selectedModes, modeId]);
    }
  };

  // Handle chat message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentMode) return;

    const userMsg = { role: 'user', text: inputMessage, timestamp: new Date() };
    setMessages([...messages, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        user_id: userId,
        message: inputMessage,
        mode: currentMode
      });

      const lunaMsg = {
        role: 'luna',
        text: response.data.response,
        mode: response.data.mode,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, lunaMsg]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMsg = {
        role: 'luna',
        text: error.response?.data?.error || 'Entschuldigung, da ist etwas schiefgelaufen!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Registration Screen
  if (!userLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.welcomeBox}>
          <h1 style={styles.title}>🌙 Luna Assistant</h1>
          <p style={styles.subtitle}>Dein persönlicher KI-Assistent für Frauen</p>
          
          <div style={styles.formGroup}>
            <label>Wie heißt du?</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Dein Name"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Wähle die Bereiche, wobei Luna dich begleiten soll:</label>
            <div style={styles.modesGrid}>
              {allModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => toggleMode(mode.id)}
                  style={{
                    ...styles.modeButton,
                    ...(selectedModes.includes(mode.id) ? styles.modeButtonSelected : {})
                  }}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRegister}
            style={styles.submitButton}
          >
            Los geht's mit Luna! ✨
          </button>
        </div>
      </div>
    );
  }

  // Chat Screen
  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        <div style={styles.header}>
          <h2>🌙 Luna Assistant</h2>
          <p>{userName}</p>
        </div>

        <div style={styles.modesBar}>
          {allModes
            .filter(m => selectedModes.includes(m.id))
            .map(mode => (
              <button
                key={mode.id}
                onClick={() => setCurrentMode(mode.id)}
                style={{
                  ...styles.modeTab,
                  ...(currentMode === mode.id ? styles.modeTabActive : {})
                }}
              >
                {mode.name}
              </button>
            ))}
        </div>

        <div style={styles.messagesContainer}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : styles.lunaMessage)
              }}
            >
              <p>{msg.text}</p>
            </div>
          ))}
          {loading && <div style={styles.message}><p>Luna denkt nach...</p></div>}
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Schreib etwas..."
            style={styles.messageInput}
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading}
            style={styles.sendButton}
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f1f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px'
  },
  welcomeBox: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    width: '100%'
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center',
    color: '#6f42c1',
    marginBottom: '10px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '1.1rem'
  },
  formGroup: {
    marginBottom: '30px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0d5f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '8px',
    boxSizing: 'border-box'
  },
  modesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '12px'
  },
  modeButton: {
    padding: '12px',
    border: '2px solid #e0d5f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.3s',
    ':hover': { borderColor: '#6f42c1' }
  },
  modeButtonSelected: {
    backgroundColor: '#6f42c1',
    color: 'white',
    borderColor: '#6f42c1'
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  chatContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '800px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '20px',
    borderBottom: '2px solid #f0f0f0',
    backgroundColor: '#6f42c1',
    color: 'white',
    borderRadius: '12px 12px 0 0'
  },
  modesBar: {
    display: 'flex',
    gap: '10px',
    padding: '12px 20px',
    borderBottom: '1px solid #f0f0f0',
    overflowX: 'auto'
  },
  modeTab: {
    padding: '8px 12px',
    border: 'none',
    backgroundColor: '#f0f0f0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap'
  },
  modeTabActive: {
    backgroundColor: '#6f42c1',
    color: 'white'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    maxWidth: '70%'
  },
  userMessage: {
    backgroundColor: '#6f42c1',
    color: 'white',
    alignSelf: 'flex-end'
  },
  lunaMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start'
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #f0f0f0'
  },
  messageInput: {
    flex: 1,
    padding: '10px 12px',
    border: '2px solid #e0d5f0',
    borderRadius: '20px',
    fontSize: '1rem'
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

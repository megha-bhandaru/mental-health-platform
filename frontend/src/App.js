import React, { useState } from 'react';
import './App.css';

const moodEmojis = ['😞', '😕', '😐', '🙂', '😄'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];

const resources = [
  { title: '🧘 Breathing Exercise', desc: 'Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.' },
  { title: '📖 Journaling', desc: 'Write 3 things you are grateful for today.' },
  { title: '🚶 Take a Walk', desc: 'A 10-minute walk can reduce anxiety significantly.' },
  { title: '📞 Talk to Someone', desc: 'iCall India Helpline: 9152987821' },
];

function App() {
  const [mood, setMood] = useState(null);
  const [log, setLog] = useState([]);
  const [note, setNote] = useState('');
  const [page, setPage] = useState('home');

  const logMood = async () => {
    if (mood === null) return alert('Please select a mood!');
    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodLabels[mood], note }),
      });
    } catch (err) {
      console.log('Could not save to backend', err);
    }
    const entry = {
      mood: moodLabels[mood],
      emoji: moodEmojis[mood],
      note,
      time: new Date().toLocaleString(),
    };
    setLog([entry, ...log]);
    setMood(null);
    setNote('');
    alert('Mood logged successfully!');
  };

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <h2 style={styles.logo}>🌱 MindSpace</h2>
        <div>
          {['home', 'log', 'resources'].map(p => (
            <button key={p} onClick={() => setPage(p)} style={styles.navBtn}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {page === 'home' && (
        <div style={styles.container}>
          <h1>How are you feeling today?</h1>
          <p style={{ color: '#888' }}>Track your mood, access resources, and take care of yourself.</p>
          <div style={styles.emojiRow}>
            {moodEmojis.map((e, i) => (
              <button key={i} onClick={() => setMood(i)}
                style={{ ...styles.emojiBtn, background: mood === i ? '#d0f0c0' : '#f0f0f0' }}>
                <div style={{ fontSize: 40 }}>{e}</div>
                <div style={{ fontSize: 12 }}>{moodLabels[i]}</div>
              </button>
            ))}
          </div>
          <textarea placeholder="Add a note (optional)..." value={note}
            onChange={e => setNote(e.target.value)} style={styles.textarea} />
          <button onClick={logMood} style={styles.btn}>Log Mood</button>
        </div>
      )}

      {page === 'log' && (
        <div style={styles.container}>
          <h1>📋 Mood History</h1>
          {log.length === 0 ? <p>No entries yet. Go log your mood!</p> :
            log.map((entry, i) => (
              <div key={i} style={styles.card}>
                <span style={{ fontSize: 32 }}>{entry.emoji}</span>
                <div>
                  <strong>{entry.mood}</strong>
                  <p style={{ margin: 0, color: '#555' }}>{entry.note || 'No note'}</p>
                  <small style={{ color: '#aaa' }}>{entry.time}</small>
                </div>
              </div>
            ))}
        </div>
      )}

      {page === 'resources' && (
        <div style={styles.container}>
          <h1>💡 Self-Help Resources</h1>
          {resources.map((r, i) => (
            <div key={i} style={styles.card}>
              <div>
                <strong>{r.title}</strong>
                <p style={{ margin: '4px 0 0', color: '#555' }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  app: { fontFamily: 'Segoe UI, sans-serif', minHeight: '100vh', background: '#f9fafb' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  logo: { margin: 0, color: '#2e7d32' },
  navBtn: { marginLeft: 12, padding: '8px 16px', border: 'none', borderRadius: 8,
    background: '#e8f5e9', color: '#2e7d32', cursor: 'pointer', fontWeight: 'bold' },
  container: { maxWidth: 700, margin: '40px auto', padding: '0 20px' },
  emojiRow: { display: 'flex', gap: 12, margin: '24px 0', flexWrap: 'wrap' },
  emojiBtn: { padding: '12px 16px', border: '2px solid #ddd', borderRadius: 12,
    cursor: 'pointer', textAlign: 'center', minWidth: 80 },
  textarea: { width: '100%', height: 80, padding: 12, borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' },
  btn: { padding: '12px 32px', background: '#2e7d32', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' },
  card: { display: 'flex', gap: 16, alignItems: 'flex-start', background: '#fff',
    padding: 16, borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
};

export default App;
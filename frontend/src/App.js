import React, { useState, useEffect } from 'react';

const moodEmojis = ['😞', '😕', '😐', '🙂', '😄'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Great'];
const moodColors = ['#ff6b6b', '#ffa94d', '#74c0fc', '#69db7c', '#a9e34b'];

const resources = [
  { icon: '🧘', title: 'Breathing Exercise', desc: 'Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s.', action: 'Try Now' },
  { icon: '📖', title: 'Journaling', desc: 'Write 3 things you are grateful for today.', action: 'Start Writing' },
  { icon: '🚶', title: 'Take a Walk', desc: 'A 10-minute walk can reduce anxiety significantly.', action: 'Get Moving' },
  { icon: '📞', title: 'Talk to Someone', desc: 'iCall India Helpline: 9152987821', action: 'Call Now' },
];

export default function App() {
  const [mood, setMood] = useState(null);
  const [log, setLog] = useState([]);
  const [note, setNote] = useState('');
  const [page, setPage] = useState('home');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/mood/history')
      .then(r => r.json())
      .then(data => { if (data.success) setLog(data.data); })
      .catch(() => {});
  }, []);

  const logMood = async () => {
    if (mood === null) return alert('Please select a mood!');
    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodLabels[mood], note }),
      });
      const res = await fetch('/api/mood/history');
      const data = await res.json();
      if (data.success) setLog(data.data);
    } catch (err) {
      console.log('Could not save', err);
    }
    setMood(null);
    setNote('');
  };

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div style={s.app}>
      {/* Background blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>🌱</div>
        <div style={s.logoText}>Mind<br/>Space</div>
        <div style={{ flex: 1 }} />
        {[
          { id: 'home', icon: '🏠', label: 'Home' },
          { id: 'log', icon: '📋', label: 'History' },
          { id: 'resources', icon: '💡', label: 'Resources' },
        ].map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{ ...s.navItem, ...(page === item.id ? s.navActive : {}) }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 11, marginTop: 4 }}>{item.label}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
      </div>

      {/* Main Content */}
      <div style={s.main}>

        {page === 'home' && (
          <>
            {/* Header */}
            <div style={s.header}>
              <div>
                <div style={s.greeting}>{greeting()}, ! 👋</div>
                <div style={s.subGreeting}>How are you feeling today?</div>
              </div>
              <div style={s.clock}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Mood Card */}
            <div style={s.card}>
              <div style={s.cardTitle}>Select your mood</div>
              <div style={s.moodRow}>
                {moodEmojis.map((e, i) => (
                  <button key={i} onClick={() => setMood(i)}
                    style={{
                      ...s.moodBtn,
                      background: mood === i ? moodColors[i] + '33' : 'rgba(255,255,255,0.05)',
                      border: mood === i ? `2px solid ${moodColors[i]}` : '2px solid transparent',
                      transform: mood === i ? 'scale(1.12)' : 'scale(1)',
                    }}>
                    <div style={{ fontSize: 36 }}>{e}</div>
                    <div style={{ fontSize: 11, color: mood === i ? moodColors[i] : '#888', marginTop: 6 }}>
                      {moodLabels[i]}
                    </div>
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Add a note about how you're feeling..."
                value={note}
                onChange={e => setNote(e.target.value)}
                style={s.textarea}
              />
              <button onClick={logMood} style={s.btn}>
                Log Mood ✨
              </button>
            </div>

            {/* Stats Row */}
            <div style={s.statsRow}>
              <div style={s.statCard}>
                <div style={s.statNum}>{log.length}</div>
                <div style={s.statLabel}>Total Entries</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statNum}>
                  {log.length > 0 ? moodEmojis[moodLabels.indexOf(log[0]?.mood)] || '😐' : '—'}
                </div>
                <div style={s.statLabel}>Last Mood</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statNum}>
                  {log.filter(e => e.mood === 'Good' || e.mood === 'Great').length}
                </div>
                <div style={s.statLabel}>Good Days</div>
              </div>
            </div>
          </>
        )}

        {page === 'log' && (
          <>
            <div style={s.header}>
              <div>
                <div style={s.greeting}>Mood History 📋</div>
                <div style={s.subGreeting}>{log.length} entries recorded</div>
              </div>
            </div>
            <div style={s.historyGrid}>
              {log.length === 0
                ? <div style={s.empty}>No entries yet. Go log your mood!</div>
                : log.map((entry, i) => (
                  <div key={i} style={s.historyCard}>
                    <div style={{ fontSize: 32 }}>
                      {moodEmojis[moodLabels.indexOf(entry.mood)] || '😐'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{entry.mood}</div>
                      <div style={{ color: '#888', fontSize: 13, margin: '4px 0' }}>
                        {entry.note || 'No note added'}
                      </div>
                      <div style={{ color: '#555', fontSize: 11 }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {page === 'resources' && (
          <>
            <div style={s.header}>
              <div>
                <div style={s.greeting}>Self-Help Resources 💡</div>
                <div style={s.subGreeting}>Tools to support your mental wellness</div>
              </div>
            </div>
            <div style={s.resourceGrid}>
              {resources.map((r, i) => (
                <div key={i} style={s.resourceCard}>
                  <div style={s.resourceIcon}>{r.icon}</div>
                  <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>{r.title}</div>
                  <div style={{ color: '#888', fontSize: 13, flex: 1 }}>{r.desc}</div>
                  <button style={s.resourceBtn}>{r.action}</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  app: {
    display: 'flex', minHeight: '100vh',
    background: '#0a0a1a',
    fontFamily: "'Segoe UI', sans-serif",
    position: 'relative', overflow: 'hidden',
    color: '#fff',
  },
  blob1: {
    position: 'fixed', width: 500, height: 500,
    borderRadius: '50%', filter: 'blur(120px)',
    background: 'rgba(99,57,255,0.25)',
    top: -100, left: -100, zIndex: 0,
    pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 400, height: 400,
    borderRadius: '50%', filter: 'blur(120px)',
    background: 'rgba(57,180,255,0.15)',
    bottom: -100, right: -100, zIndex: 0,
    pointerEvents: 'none',
  },
  sidebar: {
    width: 80, minHeight: '100vh',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '24px 0',
    position: 'relative', zIndex: 10,
  },
  logo: { fontSize: 28, marginBottom: 4 },
  logoText: {
    fontSize: 10, color: '#7c6af7', fontWeight: 700,
    textAlign: 'center', lineHeight: 1.3, marginBottom: 32,
  },
  navItem: {
    width: 56, height: 56, borderRadius: 16,
    border: 'none', background: 'transparent',
    color: '#666', cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, transition: 'all 0.2s',
  },
  navActive: {
    background: 'rgba(124,106,247,0.2)',
    color: '#7c6af7',
  },
  main: {
    flex: 1, padding: '32px 40px',
    position: 'relative', zIndex: 10,
    overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 32,
  },
  greeting: { fontSize: 28, fontWeight: 700, color: '#fff' },
  subGreeting: { fontSize: 14, color: '#666', marginTop: 4 },
  clock: {
    fontSize: 28, fontWeight: 700,
    color: 'rgba(255,255,255,0.15)',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24, padding: 32, marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16, color: '#888',
    marginBottom: 24, fontWeight: 500,
  },
  moodRow: {
    display: 'flex', gap: 16,
    marginBottom: 24, flexWrap: 'wrap',
  },
  moodBtn: {
    padding: '16px 20px', borderRadius: 16,
    cursor: 'pointer', textAlign: 'center',
    minWidth: 90, transition: 'all 0.2s',
  },
  textarea: {
    width: '100%', height: 90, padding: 16,
    borderRadius: 12, fontSize: 14,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', resize: 'none',
    marginBottom: 16, boxSizing: 'border-box',
    outline: 'none',
  },
  btn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #7c6af7, #4fa3f7)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontSize: 15, fontWeight: 600, cursor: 'pointer',
  },
  statsRow: {
    display: 'flex', gap: 16,
  },
  statCard: {
    flex: 1, padding: 24, borderRadius: 20,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center',
  },
  statNum: { fontSize: 32, fontWeight: 700, color: '#7c6af7' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  historyGrid: { display: 'flex', flexDirection: 'column', gap: 12 },
  historyCard: {
    display: 'flex', gap: 16, alignItems: 'center',
    padding: 20, borderRadius: 16,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  empty: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 16 },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  resourceCard: {
    padding: 24, borderRadius: 20,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column',
    gap: 8,
  },
  resourceIcon: { fontSize: 32, marginBottom: 4 },
  resourceBtn: {
    marginTop: 8, padding: '10px 0',
    background: 'rgba(124,106,247,0.15)',
    border: '1px solid rgba(124,106,247,0.3)',
    borderRadius: 10, color: '#7c6af7',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
};
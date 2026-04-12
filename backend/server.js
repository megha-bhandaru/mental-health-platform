const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/mindspace';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Mood Schema
const moodSchema = new mongoose.Schema({
  mood: { type: String, required: true },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});
const Mood = mongoose.model('Mood', moodSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MindSpace API is running ✅', status: 'healthy' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.post('/api/mood', async (req, res) => {
  const { mood, note } = req.body;
  if (!mood) return res.status(400).json({ error: 'Mood is required' });
  try {
    const entry = new Mood({ mood, note });
    await entry.save();
    res.json({ success: true, message: 'Mood logged', entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

app.get('/api/mood/history', async (req, res) => {
  try {
    const moods = await Mood.find().sort({ timestamp: -1 });
    res.json({ success: true, count: moods.length, data: moods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mood history' });
  }
});

app.get('/api/resources', (req, res) => {
  res.json([
    { id: 1, title: 'Breathing Exercise', desc: 'Try 4-7-8 breathing technique.' },
    { id: 2, title: 'Journaling', desc: 'Write 3 things you are grateful for.' },
    { id: 3, title: 'Take a Walk', desc: '10-minute walk reduces anxiety.' },
    { id: 4, title: 'Helpline', desc: 'iCall India: 9152987821' },
  ]);
});

// Prometheus metrics
const client = require('prom-client');
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Export for tests
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}
module.exports = app;
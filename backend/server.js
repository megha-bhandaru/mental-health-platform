const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting - max 100 requests per 15 min per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MindSpace API is running ✅', status: 'healthy' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.post('/api/mood', (req, res) => {
  const { mood, note } = req.body;
  if (!mood) return res.status(400).json({ error: 'Mood is required' });
  console.log(`Mood logged: ${mood} - ${note || 'no note'}`);
  res.json({ success: true, message: 'Mood logged', mood, note });
});

app.get('/api/resources', (req, res) => {
  res.json([
    { id: 1, title: 'Breathing Exercise', desc: 'Try 4-7-8 breathing technique.' },
    { id: 2, title: 'Journaling', desc: 'Write 3 things you are grateful for.' },
    { id: 3, title: 'Take a Walk', desc: '10-minute walk reduces anxiety.' },
    { id: 4, title: 'Helpline', desc: 'iCall India: 9152987821' },
  ]);
});

// Prometheus metrics endpoint
const client = require('prom-client');
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
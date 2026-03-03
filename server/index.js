import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import choresRoutes from './routes/chores.js';
import schoolworkRoutes from './routes/schoolwork.js';
import shoppingRoutes from './routes/shopping.js';
import projectsRoutes from './routes/projects.js';
import proxyRoutes from './routes/proxy.js';
import weatherRoutes from './routes/weather.js';
import jokeRoutes from './routes/joke.js';
import wordRoutes from './routes/word.js';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

app.set('dataDir', DATA_DIR);
app.use(express.json());

// API routes (GET endpoints public; mutating routes protected in their routers)
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/chores', choresRoutes);
app.use('/api/schoolwork', schoolworkRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', proxyRoutes); // /api/students, /api/progress
app.use('/api/weather', weatherRoutes);
app.use('/api/joke', jokeRoutes);
app.use('/api/word', wordRoutes);

// Static frontend (after build)
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
const distIndex = path.join(distPath, 'index.html');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(distIndex));
} else {
  app.get('/', (_req, res) => res.send('<p>Run <code>npm run build</code> then restart the server.</p>'));
}

app.listen(PORT, () => {
  console.log(`Dashing Dashboard server on http://localhost:${PORT}`);
});

// Keep TubularTutor (and its Neon DB) from going idle: ping every 10 minutes when configured
const KEEPALIVE_INTERVAL_MS = 10 * 60 * 1000;
const TUBULAR_BASE = process.env.TUBULAR_TUTOR_URL || 'https://tubulartutor.onrender.com';
const TUBULAR_TOKEN = process.env.TUBULAR_TUTOR_ADMIN_TOKEN;
const TUBULAR_USER = process.env.TUBULAR_TUTOR_USERNAME;
const TUBULAR_PASS = process.env.TUBULAR_TUTOR_PASSWORD;

if (TUBULAR_TOKEN || (TUBULAR_USER && TUBULAR_PASS)) {
  setInterval(async () => {
    try {
      let token = TUBULAR_TOKEN;
      if (!token && TUBULAR_USER && TUBULAR_PASS) {
        const loginRes = await fetch(`${TUBULAR_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: TUBULAR_USER, password: TUBULAR_PASS }),
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          token = data.token;
        }
      }
      if (token) {
        const res = await fetch(`${TUBULAR_BASE}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) console.warn('TubularTutor keepalive got', res.status);
      }
    } catch (err) {
      console.warn('TubularTutor keepalive failed:', err.message);
    }
  }, KEEPALIVE_INTERVAL_MS);
}

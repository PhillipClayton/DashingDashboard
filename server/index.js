import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todo.js';
import shoppingRoutes from './routes/shopping.js';
import weatherRoutes from './routes/weather.js';
import jokeRoutes from './routes/joke.js';
import wordRoutes from './routes/word.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts' },
});

app.set('dataDir', DATA_DIR);
app.use(express.json());

// The read-only dashboard is available on the LAN; list changes require admin authentication.
app.use('/api/auth/login', loginLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/joke', jokeRoutes);
app.use('/api/word', wordRoutes);

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
const distIndex = path.join(distPath, 'index.html');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(distIndex));
} else {
  app.get('/', (_req, res) => res.send('<p>Run <code>npm run build</code> then restart the server.</p>'));
}

app.listen(PORT, HOST, () => {
  console.log(`Dashing Dashboard available at http://${HOST}:${PORT} (use this machine's LAN address or hostname from other devices)`);
});

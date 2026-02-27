import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const CACHE_KEY = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
let cache = { key: null, data: null };

function getJokesPath(req) {
  return path.join(req.app.get('dataDir'), 'jokes.json');
}

async function readFallbackJokes(req) {
  try {
    const data = await fs.readFile(getJokesPath(req), 'utf8');
    const arr = JSON.parse(data);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

router.get('/', async (req, res) => {
  const key = CACHE_KEY();
  if (cache.key === key && cache.data) {
    return res.json(cache.data);
  }
  try {
    // JokeAPI: safe-mode, family/clean categories
    const url = 'https://v2.jokeapi.dev/joke/Any?safe-mode&type=twopart';
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Joke API error');
    const raw = await resp.json();
    if (raw.error === true || (raw.flags && (raw.flags.nsfw || raw.flags.racist || raw.flags.sexist))) {
      throw new Error('Unwanted joke category');
    }
    const data = {
      setup: raw.setup || '',
      delivery: raw.delivery || raw.joke || '',
      title: 'Joke of the day',
    };
    cache = { key, data };
    res.json(data);
  } catch {
    const fallback = await readFallbackJokes(req);
    const one = fallback.length ? fallback[Math.floor(Math.random() * fallback.length)] : { setup: 'No joke today.', delivery: '', title: 'Joke of the day' };
    const data = typeof one === 'string' ? { setup: one, delivery: '', title: 'Joke of the day' } : one;
    cache = { key, data };
    res.json(data);
  }
});

export default router;

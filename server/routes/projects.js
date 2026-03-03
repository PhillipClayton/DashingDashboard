import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const FILENAME = 'projects.json';

function getDataPath(req) {
  return path.join(req.app.get('dataDir'), FILENAME);
}

async function readProjects(req) {
  try {
    const data = await fs.readFile(getDataPath(req), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return { projects: [] };
    throw err;
  }
}

router.get('/', async (req, res) => {
  try {
    const data = await readProjects(req);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const dir = req.app.get('dataDir');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(getDataPath(req), JSON.stringify(req.body, null, 2));
    res.json(req.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

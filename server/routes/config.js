import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const FILENAME = 'students.json';

function getDataPath(req) {
  return path.join(req.app.get('dataDir'), FILENAME);
}

router.get('/students', async (req, res) => {
  try {
    const data = await fs.readFile(getDataPath(req), 'utf8');
    const parsed = JSON.parse(data);
    res.json(parsed);
  } catch (err) {
    if (err.code === 'ENOENT') return res.json({ students: [] });
    res.status(500).json({ error: err.message });
  }
});

router.put('/students', requireAdmin, async (req, res) => {
  try {
    const dir = req.app.get('dataDir');
    await fs.mkdir(dir, { recursive: true });
    const body = req.body && Array.isArray(req.body.students) ? req.body : { students: [] };
    await fs.writeFile(getDataPath(req), JSON.stringify(body, null, 2));
    res.json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

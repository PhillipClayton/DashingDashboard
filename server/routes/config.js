import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

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

export default router;

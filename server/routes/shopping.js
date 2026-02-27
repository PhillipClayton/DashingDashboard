import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const FILENAME = 'shopping.json';

function getDataPath(req) {
  return path.join(req.app.get('dataDir'), FILENAME);
}

async function readShopping(req) {
  try {
    const data = await fs.readFile(getDataPath(req), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return { items: [] };
    throw err;
  }
}

router.get('/', async (req, res) => {
  try {
    const data = await readShopping(req);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const data = await readShopping(req);
    const items = data.items || [];
    const newItem = {
      id: String(Date.now()),
      label: req.body?.label ?? '',
      checked: false,
    };
    items.push(newItem);
    const dir = req.app.get('dataDir');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(getDataPath(req), JSON.stringify({ items }, null, 2));
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const data = await readShopping(req);
    const items = data.items || [];
    const idx = items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    items[idx].checked = !items[idx].checked;
    await fs.writeFile(getDataPath(req), JSON.stringify({ items }, null, 2));
    res.json(items[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const data = await readShopping(req);
    const items = (data.items || []).filter((i) => i.id !== req.params.id);
    await fs.writeFile(getDataPath(req), JSON.stringify({ items }, null, 2));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

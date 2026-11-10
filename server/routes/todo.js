import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const FILENAME = 'todos.json';
const LEGACY_FILENAME = 'chores.json';

function dataPath(req, filename = FILENAME) {
  return path.join(req.app.get('dataDir'), filename);
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object' && typeof item.text === 'string')
    .map((item, index) => ({
      id: typeof item.id === 'string' ? item.id : `todo-${index}`,
      text: item.text,
      done: item.done === true,
      priority: [1, 2, 3].includes(Number(item.priority)) ? Number(item.priority) : 2,
      order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
    }))
    .sort((a, b) => a.order - b.order);
}

async function readTodos(req) {
  try {
    const stored = JSON.parse(await fs.readFile(dataPath(req), 'utf8'));
    return { items: normalizeItems(stored.items) };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // Preserve existing chore task text when the personal list is first introduced.
  try {
    const legacy = JSON.parse(await fs.readFile(dataPath(req, LEGACY_FILENAME), 'utf8'));
    const tasks = (legacy.people ?? []).flatMap((person) => person.tasks ?? []);
    return {
      items: normalizeItems(tasks.map((text, order) => ({
        id: `todo-migrated-${order}`,
        text,
        done: false,
        priority: 2,
        order,
      }))),
    };
  } catch (error) {
    if (error.code === 'ENOENT') return { items: [] };
    throw error;
  }
}

router.get('/', async (req, res) => {
  try {
    res.json(await readTodos(req));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  if (!Array.isArray(req.body?.items)) {
    return res.status(400).json({ error: 'Expected an items array' });
  }
  try {
    const items = normalizeItems(req.body.items).map((item, order) => ({ ...item, order }));
    const dir = req.app.get('dataDir');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(dataPath(req), JSON.stringify({ items }, null, 2));
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

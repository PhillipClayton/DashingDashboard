import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const SECRET = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'fallback-secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured with ADMIN_PASSWORD' });
  }
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign(
    { admin: true },
    SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token });
});

router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

export default router;

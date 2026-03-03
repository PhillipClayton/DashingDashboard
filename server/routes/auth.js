import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'fallback-secret';
  const { password } = req.body || {};
  if (!adminPassword) {
    return res.status(500).json({ error: 'Server not configured with ADMIN_PASSWORD' });
  }
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign(
    { admin: true },
    secret,
    { expiresIn: '7d' }
  );
  res.json({ token });
});

router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

export default router;

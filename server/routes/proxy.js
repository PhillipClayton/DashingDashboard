import { Router } from 'express';

const router = Router();

function getProxyConfig() {
  return {
    base: process.env.TUBULAR_TUTOR_URL || 'https://tubulartutor.onrender.com',
    token: process.env.TUBULAR_TUTOR_ADMIN_TOKEN,
  };
}

async function proxy(req, res) {
  const { base, token } = getProxyConfig();
  if (!token) {
    return res.status(503).json({ error: 'TubularTutor not configured' });
  }
  const path = req.path.replace(/^\/api/, '');
  const url = `${base}${path}`;
  try {
    const resp = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(req.headers['content-type'] && { 'Content-Type': req.headers['content-type'] }),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    const text = await resp.text();
    if (!resp.ok) {
      return res.status(resp.status).send(text);
    }
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (err) {
    res.status(502).json({ error: err.message || 'Proxy failed' });
  }
}

router.get('/students', proxy);
router.get('/students/:id/courses', proxy);
router.get('/students/:id/progress', proxy);

export default router;

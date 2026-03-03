import { Router } from 'express';

const router = Router();

function getConfig() {
  return {
    base: process.env.TUBULAR_TUTOR_URL || 'https://tubulartutor.onrender.com',
    adminToken: process.env.TUBULAR_TUTOR_ADMIN_TOKEN,
    username: process.env.TUBULAR_TUTOR_USERNAME,
    password: process.env.TUBULAR_TUTOR_PASSWORD,
  };
}

let cachedToken = null;

async function getToken() {
  const { base, adminToken, username, password } = getConfig();
  if (adminToken) return adminToken;
  if (username && password) {
    if (cachedToken) return cachedToken;
    const res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'TubularTutor login failed');
    }
    const data = await res.json();
    cachedToken = data.token || null;
    return cachedToken;
  }
  return null;
}

async function proxy(req, res) {
  const config = getConfig();
  const token = await getToken();
  if (!token) {
    return res.status(503).json({
      error: 'Set TUBULAR_TUTOR_ADMIN_TOKEN or both TUBULAR_TUTOR_USERNAME and TUBULAR_TUTOR_PASSWORD in .env',
    });
  }
  const path = req.path.replace(/^\/api/, '') || '';
  const url = `${config.base}/api${path}`;
  try {
    let resp = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(req.headers['content-type'] && { 'Content-Type': req.headers['content-type'] }),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    if (resp.status === 401 && config.username && config.password && !config.adminToken) {
      cachedToken = null;
      const newToken = await getToken();
      if (newToken) {
        resp = await fetch(`${config.base}/api${path}`, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
            ...(req.headers['content-type'] && { 'Content-Type': req.headers['content-type'] }),
          },
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        });
      }
    }
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

router.get('/admin/students', proxy);
router.get('/students/:id/courses', proxy);
router.get('/students/:id/progress', proxy);

export default router;

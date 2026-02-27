import { Router } from 'express';

const router = Router();
const LAT = process.env.WEATHER_LAT || '37.7749';
const LON = process.env.WEATHER_LON || '-122.4194';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
let cache = { data: null, at: 0 };

async function fetchWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_100m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API error');
  return res.json();
}

router.get('/', async (req, res) => {
  const now = Date.now();
  if (cache.data && now - cache.at < CACHE_TTL_MS) {
    return res.json(cache.data);
  }
  try {
    const raw = await fetchWeather();
    const current = raw.current || {};
    const dailyArr = raw.daily;
    const daily = dailyArr && dailyArr.time && dailyArr.time[0] ? {
      date: dailyArr.time[0],
      tempMax: dailyArr.temperature_2m_max?.[0],
      tempMin: dailyArr.temperature_2m_min?.[0],
      precipChance: dailyArr.precipitation_probability_max?.[0],
    } : null;
    cache = {
      data: {
        current: {
          temp: current.temperature_2m,
          humidity: current.relative_humidity_100m,
          weatherCode: current.weather_code,
        },
        daily: daily,
      },
      at: now,
    };
    res.json(cache.data);
  } catch (err) {
    res.status(502).json({ error: err.message || 'Weather unavailable' });
  }
});

export default router;

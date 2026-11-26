import { Router } from 'express';

const router = Router();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
let cache = { data: null, at: 0 };

function getWeatherLocation() {
  const lat = process.env.WEATHER_LAT?.trim();
  const lon = process.env.WEATHER_LON?.trim();
  const name = process.env.WEATHER_LOCATION_NAME?.trim();

  if (!lat || !lon) {
    throw new Error('Weather location is not configured. Set WEATHER_LAT and WEATHER_LON in .env');
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('WEATHER_LAT must be a number between -90 and 90');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('WEATHER_LON must be a number between -180 and 180');
  }

  return {
    latitude,
    longitude,
    name: name || `${latitude}, ${longitude}`,
  };
}

async function fetchWeather(location) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_100m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Weather API error');
  return res.json();
}

router.get('/', async (_req, res) => {
  let location;
  try {
    location = getWeatherLocation();
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : 'Weather location is not configured' });
  }

  const now = Date.now();
  if (cache.data && now - cache.at < CACHE_TTL_MS) {
    return res.json({ ...cache.data, location: location.name, updatedAt: new Date(cache.at).toISOString(), stale: false });
  }
  try {
    const raw = await fetchWeather(location);
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
        location: location.name,
        current: {
          temp: current.temperature_2m,
          humidity: current.relative_humidity_100m,
          weatherCode: current.weather_code,
        },
        daily,
      },
      at: Date.now(),
    };
    res.json({ ...cache.data, updatedAt: new Date(cache.at).toISOString(), stale: false });
  } catch (err) {
    if (cache.data) {
      return res.json({ ...cache.data, updatedAt: new Date(cache.at).toISOString(), stale: true });
    }
    res.status(502).json({ error: err instanceof Error ? err.message : 'Weather unavailable', location: location.name });
  }
});

export default router;

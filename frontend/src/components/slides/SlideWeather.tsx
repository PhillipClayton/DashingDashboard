import { useEffect, useState } from 'react';
import { api, type WeatherData } from '../../api';

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Showers',
  95: 'Thunderstorm',
};

function weatherLabel(code: number): string {
  return WEATHER_CODES[code] ?? 'Unknown';
}

export default function SlideWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<WeatherData>('/api/weather')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading weather…</div>;

  const cur = data.current;
  const daily = data.daily;

  return (
    <div className="slide__content slide-weather">
      <h2 className="slide__title">Weather today</h2>
      <div className="slide-weather__main">
        {cur?.temp != null && (
          <p className="slide-weather__temp">{Math.round(cur.temp)}°</p>
        )}
        {cur?.weatherCode != null && (
          <p className="slide-weather__conditions">{weatherLabel(cur.weatherCode)}</p>
        )}
        {cur?.humidity != null && (
          <p className="slide-weather__meta">Humidity {cur.humidity}%</p>
        )}
      </div>
      {daily && (daily.tempMax != null || daily.tempMin != null) && (
        <div className="slide-weather__daily">
          <span>H {daily.tempMax != null ? Math.round(daily.tempMax) : '—'}°</span>
          <span>L {daily.tempMin != null ? Math.round(daily.tempMin) : '—'}°</span>
          {daily.precipChance != null && (
            <span>{daily.precipChance}% precip</span>
          )}
        </div>
      )}
    </div>
  );
}

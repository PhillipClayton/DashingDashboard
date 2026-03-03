import { useEffect, useState } from 'react';
import { api, type JokeData } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';

export default function SlideJoke() {
  const [data, setData] = useState<JokeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTick = useRefreshTick();

  useEffect(() => {
    api<JokeData>('/api/joke')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [refreshTick]);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading joke…</div>;

  return (
    <div className="slide__content slide-joke">
      <h2 className="slide__title">{data.title ?? 'Joke of the day'}</h2>
      <div className="slide-joke__body">
        {data.setup && <p className="slide-joke__setup">{data.setup}</p>}
        {data.delivery && <p className="slide-joke__delivery">{data.delivery}</p>}
      </div>
    </div>
  );
}

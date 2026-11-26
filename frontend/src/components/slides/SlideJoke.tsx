import { useEffect, useState } from 'react';
import { api, type JokeData } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';
import SlideUpdatedAt from './SlideUpdatedAt';

export default function SlideJoke() {
  const [data, setData] = useState<JokeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTick = useRefreshTick();

  useEffect(() => {
    api<JokeData>('/api/joke')
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [refreshTick]);

  if (error && !data) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading joke…</div>;

  return (
    <div className="slide__content slide-joke">
      <h2 className="slide__title">{data.title ?? 'Joke of the day'}</h2>
      {error && <p className="slide__meta">Refresh failed: {error}</p>}
      <div className="slide-joke__body">
        {data.setup && <p className="slide-joke__setup">{data.setup}</p>}
        {data.delivery && <p className="slide-joke__delivery">{data.delivery}</p>}
      </div>
      <SlideUpdatedAt updatedAt={data.updatedAt} />
    </div>
  );
}

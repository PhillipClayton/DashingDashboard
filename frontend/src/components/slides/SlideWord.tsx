import { useEffect, useState } from 'react';
import { api, type WordData } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';

export default function SlideWord() {
  const [data, setData] = useState<WordData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTick = useRefreshTick();

  useEffect(() => {
    api<WordData>('/api/word')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [refreshTick]);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading word…</div>;
  if (!data.definition?.trim()) return <div className="slide__loading">Loading word…</div>;

  return (
    <div className="slide__content slide-word">
      <h2 className="slide__title">Word of the day</h2>
      <p className="slide-word__word">{data.word}</p>
      <p className="slide-word__definition">{data.definition}</p>
      {data.example && (
        <p className="slide-word__example">“{data.example}”</p>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api, type WordData } from '../../api';

export default function SlideWord() {
  const [data, setData] = useState<WordData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<WordData>('/api/word')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading word…</div>;

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

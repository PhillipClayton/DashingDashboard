import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';

type Kind = 'fact' | 'quote' | 'puzzle' | 'math';
type DailyContent = {
  text?: string;
  quote?: string;
  author?: string;
  question?: string;
  answer?: string;
  title?: string;
  source?: string;
  sourceUrl?: string;
};

const content = {
  fact: { endpoint: 'fact', title: 'Fact of the day' },
  quote: { endpoint: 'quote', title: 'Philosophy quote' },
  puzzle: { endpoint: 'puzzle', title: 'Brain teaser' },
  math: { endpoint: 'math', title: 'A mathematical idea' },
} satisfies Record<Kind, { endpoint: string; title: string }>;

export default function SlideDaily({ kind }: { kind: Kind }) {
  const [data, setData] = useState<DailyContent | null>(null);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);
  const refreshTick = useRefreshTick();
  const item = content[kind];

  useEffect(() => {
    setError('');
    setRevealed(false);
    api<DailyContent>(`/api/daily/${item.endpoint}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Daily content unavailable'));
  }, [item.endpoint, refreshTick]);

  if (error) return <div className="slide__error">Daily content is temporarily unavailable. {error}</div>;
  if (!data) return <div className="slide__loading">Loading {item.title.toLowerCase()}…</div>;

  return (
    <div className="slide__content slide-daily">
      <h2 className="slide__title">{item.title}</h2>
      {kind === 'fact' && <p className="slide-daily__text">{data.text}</p>}
      {kind === 'quote' && <blockquote className="slide-daily__text">“{data.quote}”<footer>— {data.author}</footer></blockquote>}
      {kind === 'puzzle' && (
        <div className="slide-daily__text">
          <p>{data.question}</p>
          <button type="button" className="slide-daily__reveal" onClick={() => setRevealed((value) => !value)}>
            {revealed ? 'Hide answer' : 'Reveal answer'}
          </button>
          {revealed && <p className="slide-daily__answer">{data.answer}</p>}
        </div>
      )}
      {kind === 'math' && (
        <div className="slide-daily__text">
          <h3>{data.title}</h3>
          <p>{data.text}</p>
        </div>
      )}
      {data.sourceUrl ? (
        <p className="slide-daily__source">Source: <a href={data.sourceUrl} target="_blank" rel="noreferrer">{data.source}</a></p>
      ) : <p className="slide-daily__source">{data.source}</p>}
    </div>
  );
}

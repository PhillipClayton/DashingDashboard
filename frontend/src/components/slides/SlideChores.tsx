import { useEffect, useState } from 'react';
import { api, type ChoresData } from '../../api';

export default function SlideChores() {
  const [data, setData] = useState<ChoresData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<ChoresData>('/api/chores')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading chores…</div>;

  const people = data.people ?? [];
  if (people.length === 0) return <div className="slide__empty">No chores assigned.</div>;

  return (
    <div className="slide__content slide-chores">
      <h2 className="slide__title">Chores</h2>
      <div className="slide-chores__grid">
        {people.map((p) => (
          <div key={p.id} className="slide-chores__person">
            <h3 className="slide-chores__name">{p.name || 'Unnamed'}</h3>
            <ul className="slide-chores__list">
              {(p.tasks ?? []).map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

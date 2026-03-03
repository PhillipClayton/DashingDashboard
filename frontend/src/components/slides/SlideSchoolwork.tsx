import { useEffect, useState } from 'react';
import { api, type SchoolworkData } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';

export default function SlideSchoolwork() {
  const [data, setData] = useState<SchoolworkData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTick = useRefreshTick();

  useEffect(() => {
    api<SchoolworkData>('/api/schoolwork')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [refreshTick]);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading schoolwork…</div>;

  const students = data.students ?? [];
  if (students.length === 0) return <div className="slide__empty">No schoolwork lists.</div>;

  return (
    <div className="slide__content slide-schoolwork">
      <h2 className="slide__title">Schoolwork</h2>
      <div className="slide-schoolwork__grid">
        {students.map((s) => (
          <div key={s.id} className="slide-schoolwork__student">
            <h3 className="slide-schoolwork__name">{s.name || 'Student'}</h3>
            <ul className="slide-schoolwork__list">
              {(s.items ?? []).map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

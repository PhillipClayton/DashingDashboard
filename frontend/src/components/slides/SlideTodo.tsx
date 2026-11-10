import { useEffect, useState } from 'react';
import { api, type TodoData } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';

export default function SlideTodo() {
  const [data, setData] = useState<TodoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTick = useRefreshTick();

  useEffect(() => {
    setError(null);
    api<TodoData>('/api/todo')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [refreshTick]);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading To Do list…</div>;

  const items = [...(data.items ?? [])].sort((a, b) => a.order - b.order);
  if (items.length === 0) return <div className="slide__empty">Your To Do list is empty.</div>;

  return (
    <div className="slide__content slide-todo">
      <h2 className="slide__title">To Do</h2>
      <ul className="slide-todo__list">
        {items.map((item) => (
          <li key={item.id} className={`slide-todo__item${item.done ? ' slide-todo__item--done' : ''}`}>
            <span className={`slide-todo__priority slide-todo__priority--${item.priority}`} aria-label={`Priority ${item.priority}`} />
            <span>{item.text}</span>
            {item.done && <span className="slide-todo__done-label">Done</span>}
          </li>
        ))}
      </ul>
      <p className="slide-todo__hint">Edit your list on the LAN at <strong>/todo</strong></p>
    </div>
  );
}

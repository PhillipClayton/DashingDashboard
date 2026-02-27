import { useEffect, useState } from 'react';
import { api, type ShoppingData } from '../../api';

export default function SlideShopping() {
  const [data, setData] = useState<ShoppingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<ShoppingData>('/api/shopping')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading shopping list…</div>;

  const items = data.items ?? [];
  if (items.length === 0) return <div className="slide__empty">Shopping list is empty.</div>;

  return (
    <div className="slide__content slide-shopping">
      <h2 className="slide__title">Shopping list</h2>
      <ul className="slide-shopping__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`slide-shopping__item ${item.checked ? 'slide-shopping__item--checked' : ''}`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

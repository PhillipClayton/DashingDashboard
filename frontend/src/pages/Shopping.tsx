import { useEffect, useState } from 'react';
import { api, apiWithAuth, type ShoppingData } from '../api';

const AUTH_KEY = 'dashing_admin_token';

export default function Shopping() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_KEY));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [items, setItems] = useState<ShoppingData['items'] | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) localStorage.setItem(AUTH_KEY, token);
    else localStorage.removeItem(AUTH_KEY);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    api<ShoppingData>('/api/shopping')
      .then((data) => setItems(data.items ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load list'));
  }, [token]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    try {
      const result = await api<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setToken(result.token);
      setPassword('');
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  const reload = async () => {
    const data = await api<ShoppingData>('/api/shopping');
    setItems(data.items ?? []);
  };

  const add = async () => {
    const label = newLabel.trim();
    if (!label || !token) return;
    setError('');
    setMessage('');
    try {
      await apiWithAuth(token)('/api/shopping', { method: 'POST', body: JSON.stringify({ label }) });
      setNewLabel('');
      await reload();
      setMessage('Added.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Add failed');
    }
  };

  const updateItem = async (id: string, method: 'PATCH' | 'DELETE') => {
    if (!token) return;
    setError('');
    setMessage('');
    try {
      await apiWithAuth(token)(`/api/shopping/${encodeURIComponent(id)}`, { method });
      await reload();
      if (method === 'PATCH') setMessage('Updated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  if (!token) {
    return (
      <main className="todo-editor todo-editor--login">
        <h1>Shopping list</h1>
        <p>Sign in with your dashboard admin password to edit your shopping list.</p>
        <form onSubmit={login}>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
          <button type="submit">Log in</button>
        </form>
        {loginError && <p className="admin__error" role="alert">{loginError}</p>}
      </main>
    );
  }

  return (
    <main className="todo-editor">
      <header className="todo-editor__header">
        <div><h1>Shopping list</h1><p>Add items, check off purchases, or remove items.</p></div>
        <button type="button" className="admin__logout" onClick={() => setToken(null)}>Log out</button>
      </header>
      <p><a href="/admin">List editor home</a> · <a href="/">View dashboard</a></p>
      {items === null ? <p>Loading your list…</p> : (
        <>
          <div className="todo-editor__actions">
            <input aria-label="New shopping item" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="What do you need to buy?" onKeyDown={(e) => e.key === 'Enter' && add()} />
            <button type="button" onClick={add} disabled={!newLabel.trim()}>Add item</button>
          </div>
          <ul className="admin__list admin__list--shopping">
            {items.map((item) => (
              <li key={item.id}>
                <label>
                  <input type="checkbox" checked={item.checked} onChange={() => updateItem(item.id, 'PATCH')} />
                  <span className={item.checked ? 'admin__strike' : ''}>{item.label}</span>
                </label>
                <button type="button" onClick={() => updateItem(item.id, 'DELETE')}>Delete</button>
              </li>
            ))}
          </ul>
          {items.length === 0 && <p>Your shopping list is empty.</p>}
          {message && <p className="admin__message" role="status">{message}</p>}
          {error && <p className="admin__error" role="alert">{error}</p>}
        </>
      )}
    </main>
  );
}

import { useEffect, useState } from 'react';
import { api, apiWithAuth, type TodoData, type TodoItem } from '../api';

const AUTH_KEY = 'dashing_admin_token';
const PRIORITIES = [
  { value: 1, label: 'High' },
  { value: 2, label: 'Normal' },
  { value: 3, label: 'Low' },
];

export default function Todo() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_KEY));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [items, setItems] = useState<TodoItem[] | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem(AUTH_KEY, token);
    else localStorage.removeItem(AUTH_KEY);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    api<TodoData>('/api/todo')
      .then((data) => setItems([...(data.items ?? [])].sort((a, b) => a.order - b.order)))
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

  const update = (index: number, patch: Partial<TodoItem>) => {
    setItems((current) => current?.map((item, i) => i === index ? { ...item, ...patch } : item) ?? null);
    setMessage('');
  };

  const add = () => {
    setItems((current) => [...(current ?? []), {
      id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: '', done: false, priority: 2, order: current?.length ?? 0,
    }]);
    setMessage('');
  };

  const remove = (index: number) => {
    setItems((current) => current?.filter((_, i) => i !== index) ?? null);
    setMessage('');
  };

  const move = (index: number, direction: -1 | 1) => {
    setItems((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
    setMessage('');
  };

  const save = async () => {
    if (!items || !token) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = { items: items.map((item, order) => ({ ...item, text: item.text.trim(), order })).filter((item) => item.text) };
      const saved = await apiWithAuth(token)<TodoData>('/api/todo', {
        method: 'PUT', body: JSON.stringify(data),
      });
      setItems(saved.items);
      setMessage('Saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <main className="todo-editor todo-editor--login">
        <h1>To Do list</h1>
        <p>Sign in with your dashboard admin password to edit your personal list.</p>
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
        <div><h1>My To Do list</h1><p>Add tasks, set priorities, and move them into your preferred order.</p></div>
        <button type="button" className="admin__logout" onClick={() => setToken(null)}>Log out</button>
      </header>
      {items === null ? <p>Loading your list…</p> : (
        <>
          <ul className="todo-editor__list">
            {items.map((item, index) => (
              <li className="todo-editor__item" key={item.id}>
                <input className="todo-editor__check" type="checkbox" aria-label={`Mark ${item.text || 'task'} done`} checked={item.done} onChange={(e) => update(index, { done: e.target.checked })} />
                <input className={`todo-editor__text${item.done ? ' todo-editor__text--done' : ''}`} aria-label="Task" type="text" placeholder="What do you need to do?" value={item.text} onChange={(e) => update(index, { text: e.target.value })} />
                <select aria-label="Priority" value={item.priority} onChange={(e) => update(index, { priority: Number(e.target.value) })}>
                  {PRIORITIES.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
                </select>
                <div className="todo-editor__order">
                  <button type="button" aria-label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                  <button type="button" aria-label="Move down" onClick={() => move(index, 1)} disabled={index === items.length - 1}>↓</button>
                </div>
                <button type="button" className="todo-editor__remove" onClick={() => remove(index)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="todo-editor__actions">
            <button type="button" onClick={add}>Add task</button>
            <button type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save list'}</button>
            {message && <span className="admin__message" role="status">{message}</span>}
            {error && <span className="admin__error" role="alert">{error}</span>}
          </div>
        </>
      )}
    </main>
  );
}

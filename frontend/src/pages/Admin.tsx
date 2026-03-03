import { useState, useEffect } from 'react';
import { api, apiWithAuth, type ChoresData, type SchoolworkData, type ShoppingData, type ProjectsData, type StudentConfig, type TubularStudent } from '../api';

const AUTH_KEY = 'dashing_admin_token';

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_KEY));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'chores' | 'schoolwork' | 'shopping' | 'projects' | 'progress'>('chores');

  useEffect(() => {
    if (token) localStorage.setItem(AUTH_KEY, token);
    else localStorage.removeItem(AUTH_KEY);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setToken(res.token);
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = () => setToken(null);

  if (!token) {
    return (
      <div className="admin admin--login">
        <h1>Admin login</h1>
        <form onSubmit={handleLogin}>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit">Log in</button>
        </form>
        {loginError && <p className="admin__error">{loginError}</p>}
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <h1>Dashboard admin</h1>
        <button type="button" className="admin__logout" onClick={handleLogout}>
          Log out
        </button>
      </header>
      <nav className="admin__tabs">
        <button
          type="button"
          className={activeTab === 'chores' ? 'admin__tab--active' : ''}
          onClick={() => setActiveTab('chores')}
        >
          Chores
        </button>
        <button
          type="button"
          className={activeTab === 'schoolwork' ? 'admin__tab--active' : ''}
          onClick={() => setActiveTab('schoolwork')}
        >
          Schoolwork
        </button>
        <button
          type="button"
          className={activeTab === 'shopping' ? 'admin__tab--active' : ''}
          onClick={() => setActiveTab('shopping')}
        >
          Shopping
        </button>
        <button
          type="button"
          className={activeTab === 'projects' ? 'admin__tab--active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          type="button"
          className={activeTab === 'progress' ? 'admin__tab--active' : ''}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
      </nav>
      {activeTab === 'chores' && <AdminChores token={token} />}
      {activeTab === 'schoolwork' && <AdminSchoolwork token={token} />}
      {activeTab === 'shopping' && <AdminShopping token={token} />}
      {activeTab === 'projects' && <AdminProjects token={token} />}
      {activeTab === 'progress' && <AdminProgress token={token} />}
    </div>
  );
}

function AdminChores({ token }: { token: string }) {
  const [data, setData] = useState<ChoresData | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const authed = apiWithAuth(token);

  useEffect(() => {
    api<ChoresData>('/api/chores')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const save = async () => {
    if (!data) return;
    setError('');
    setMessage('');
    try {
      const toSave = {
        ...data,
        people: (data.people ?? []).map((p) => ({
          ...p,
          tasks: (p.tasks ?? []).filter((t) => t.trim() !== ''),
        })),
      };
      await authed('/api/chores', { method: 'PUT', body: JSON.stringify(toSave) });
      setData(toSave);
      setMessage('Saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const updatePerson = (index: number, value: string) => {
    if (!data) return;
    const people = [...(data.people ?? [])];
    while (people.length <= index) {
      people.push({ id: `p${people.length}`, name: '', tasks: [] });
    }
    people[index] = { ...people[index], name: value };
    setData({ ...data, people });
  };

  const addTask = (personIndex: number) => {
    if (!data) return;
    const people = [...(data.people ?? [])];
    const p = people[personIndex];
    if (!p) return;
    const tasks = [...(p.tasks ?? []), ''];
    people[personIndex] = { ...p, tasks };
    setData({ ...data, people });
  };

  const updateTask = (personIndex: number, taskIndex: number, value: string) => {
    if (!data) return;
    const people = [...(data.people ?? [])];
    const p = people[personIndex];
    if (!p) return;
    const tasks = [...(p.tasks ?? [])];
    while (tasks.length <= taskIndex) tasks.push('');
    tasks[taskIndex] = value;
    people[personIndex] = { ...p, tasks };
    setData({ ...data, people });
  };

  const removeTask = (personIndex: number, taskIndex: number) => {
    if (!data) return;
    const people = [...(data.people ?? [])];
    const p = people[personIndex];
    if (!p) return;
    const tasks = (p.tasks ?? []).filter((_, i) => i !== taskIndex);
    people[personIndex] = { ...p, tasks };
    setData({ ...data, people });
  };

  if (error && !data) return <p className="admin__error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const people = data.people ?? [];

  if (people.length === 0) {
    return (
      <section className="admin__section">
        <h2>Chores</h2>
        <p>No people yet. Add one to get started.</p>
        <button type="button" onClick={() => setData({ ...data, people: [{ id: 'p0', name: '', tasks: [] }] })}>
          Add person
        </button>
        {message && <span className="admin__message">{message}</span>}
        {error && <span className="admin__error">{error}</span>}
      </section>
    );
  }

  return (
    <section className="admin__section">
      <h2>Chores</h2>
      <p>Edit names and add/remove tasks for each person (e.g. 4 people).</p>
      {people.map((p, i) => (
        <div key={p.id} className="admin__block">
          <label>
            Name
            <input
              value={p.name}
              onChange={(e) => updatePerson(i, e.target.value)}
              placeholder="Person name"
            />
          </label>
          <ul className="admin__list">
            {(p.tasks ?? []).map((task, ti) => (
              <li key={ti}>
                <input
                  value={task}
                  onChange={(e) => updateTask(i, ti, e.target.value)}
                  placeholder="Chore or task"
                />
                <button type="button" onClick={() => removeTask(i, ti)}>Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => addTask(i)}>Add task</button>
        </div>
      ))}
      <button type="button" onClick={() => setData({ ...data, people: [...people, { id: `p${people.length}`, name: '', tasks: [] }] })}>
        Add person
      </button>
      <button type="button" onClick={save}>Save</button>
      {message && <span className="admin__message">{message}</span>}
      {error && <span className="admin__error">{error}</span>}
    </section>
  );
}

function AdminSchoolwork({ token }: { token: string }) {
  const [data, setData] = useState<SchoolworkData | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const authed = apiWithAuth(token);

  useEffect(() => {
    api<SchoolworkData>('/api/schoolwork')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const save = async () => {
    if (!data) return;
    setError('');
    setMessage('');
    try {
      await authed('/api/schoolwork', { method: 'PUT', body: JSON.stringify(data) });
      setMessage('Saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const updateStudent = (index: number, field: 'name' | 'items', value: string | Array<{ id: string; label: string }>) => {
    if (!data) return;
    const students = [...(data.students ?? [])];
    while (students.length <= index) {
      students.push({ id: `s${students.length}`, name: '', items: [] });
    }
    if (field === 'name') students[index] = { ...students[index], name: value as string };
    else students[index] = { ...students[index], items: value as Array<{ id: string; label: string }> };
    setData({ ...data, students });
  };

  const addItem = (studentIndex: number) => {
    if (!data) return;
    const students = [...(data.students ?? [])];
    const s = students[studentIndex];
    if (!s) return;
    const items = [...(s.items ?? []), { id: `i${Date.now()}`, label: '' }];
    students[studentIndex] = { ...s, items };
    setData({ ...data, students });
  };

  const updateItem = (studentIndex: number, itemIndex: number, label: string) => {
    if (!data) return;
    const students = [...(data.students ?? [])];
    const s = students[studentIndex];
    if (!s) return;
    const items = [...(s.items ?? [])];
    items[itemIndex] = { ...items[itemIndex], label };
    students[studentIndex] = { ...s, items };
    setData({ ...data, students });
  };

  const removeItem = (studentIndex: number, itemIndex: number) => {
    if (!data) return;
    const students = [...(data.students ?? [])];
    const s = students[studentIndex];
    if (!s) return;
    const items = (s.items ?? []).filter((_, i) => i !== itemIndex);
    students[studentIndex] = { ...s, items };
    setData({ ...data, students });
  };

  if (error && !data) return <p className="admin__error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const students = data.students ?? [];

  if (students.length === 0) {
    return (
      <section className="admin__section">
        <h2>Schoolwork / course lists</h2>
        <p>No students yet. Add one to get started.</p>
        <button type="button" onClick={() => setData({ ...data, students: [{ id: 's0', name: '', items: [] }] })}>
          Add student
        </button>
        {message && <span className="admin__message">{message}</span>}
        {error && <span className="admin__error">{error}</span>}
      </section>
    );
  }

  return (
    <section className="admin__section">
      <h2>Schoolwork / course lists</h2>
      <p>One list per student. These are independent of progress % (any task or course name).</p>
      {students.map((s, si) => (
        <div key={s.id} className="admin__block">
          <label>
            Student name
            <input
              value={s.name}
              onChange={(e) => updateStudent(si, 'name', e.target.value)}
              placeholder="Student name"
            />
          </label>
          <ul className="admin__list">
            {(s.items ?? []).map((item, ii) => (
              <li key={item.id}>
                <input
                  value={item.label}
                  onChange={(e) => updateItem(si, ii, e.target.value)}
                  placeholder="Course or task"
                />
                <button type="button" onClick={() => removeItem(si, ii)}>Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => addItem(si)}>Add item</button>
        </div>
      ))}
      <button type="button" onClick={() => setData({ ...data, students: [...students, { id: `s${students.length}`, name: '', items: [] }] })}>
        Add student
      </button>
      <button type="button" onClick={save}>Save</button>
      {message && <span className="admin__message">{message}</span>}
      {error && <span className="admin__error">{error}</span>}
    </section>
  );
}

function AdminShopping({ token }: { token: string }) {
  const [data, setData] = useState<ShoppingData | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const authed = apiWithAuth(token);

  useEffect(() => {
    api<ShoppingData>('/api/shopping')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const addItem = async () => {
    const label = newLabel.trim();
    if (!label) return;
    setError('');
    setMessage('');
    try {
      await authed('/api/shopping', { method: 'POST', body: JSON.stringify({ label }) });
      setNewLabel('');
      const updated = await api<ShoppingData>('/api/shopping');
      setData(updated);
      setMessage('Added.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Add failed');
    }
  };

  const toggle = async (id: string) => {
    setError('');
    try {
      await authed(`/api/shopping/${id}`, { method: 'PATCH' });
      const updated = await api<ShoppingData>('/api/shopping');
      setData(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const remove = async (id: string) => {
    setError('');
    try {
      await authed(`/api/shopping/${id}`, { method: 'DELETE' });
      const updated = await api<ShoppingData>('/api/shopping');
      setData(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (error && !data) return <p className="admin__error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const items = data.items ?? [];

  return (
    <section className="admin__section">
      <h2>Shopping list</h2>
      <div className="admin__block">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New item"
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button type="button" onClick={addItem}>Add</button>
      </div>
      <ul className="admin__list admin__list--shopping">
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggle(item.id)}
              />
              <span className={item.checked ? 'admin__strike' : ''}>{item.label}</span>
            </label>
            <button type="button" onClick={() => remove(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {message && <span className="admin__message">{message}</span>}
      {error && <span className="admin__error">{error}</span>}
    </section>
  );
}

function AdminProjects({ token }: { token: string }) {
  const [data, setData] = useState<ProjectsData | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const authed = apiWithAuth(token);

  useEffect(() => {
    api<ProjectsData>('/api/projects')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const save = async () => {
    if (!data) return;
    setError('');
    setMessage('');
    try {
      const toSave = {
        ...data,
        projects: (data.projects ?? []).filter((p) => p.label.trim() !== ''),
      };
      await authed('/api/projects', { method: 'PUT', body: JSON.stringify(toSave) });
      setData(toSave);
      setMessage('Saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const addProject = () => {
    if (!data) return;
    const projects = [...(data.projects ?? []), { id: `p${Date.now()}`, label: '' }];
    setData({ ...data, projects });
  };

  const updateProject = (index: number, label: string) => {
    if (!data) return;
    const projects = [...(data.projects ?? [])];
    projects[index] = { ...projects[index], label };
    setData({ ...data, projects });
  };

  const removeProject = (index: number) => {
    if (!data) return;
    const projects = (data.projects ?? []).filter((_, i) => i !== index);
    setData({ ...data, projects });
  };

  if (error && !data) return <p className="admin__error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  const projects = data.projects ?? [];

  return (
    <section className="admin__section">
      <h2>Home improvement projects</h2>
      <p>Add or edit project names. They will appear on the dashboard slide.</p>
      <ul className="admin__list">
        {projects.map((project, i) => (
          <li key={project.id}>
            <input
              value={project.label}
              onChange={(e) => updateProject(i, e.target.value)}
              placeholder="Project name"
            />
            <button type="button" onClick={() => removeProject(i)}>Remove</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addProject}>Add project</button>
      <button type="button" onClick={save}>Save</button>
      {message && <span className="admin__message">{message}</span>}
      {error && <span className="admin__error">{error}</span>}
    </section>
  );
}

function AdminProgress({ token }: { token: string }) {
  const [tubularList, setTubularList] = useState<TubularStudent[]>([]);
  const [config, setConfig] = useState<StudentConfig | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const authed = apiWithAuth(token);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<TubularStudent[] | { students?: TubularStudent[] }>('/api/admin/students').then((raw) => {
        const list = Array.isArray(raw) ? raw : (raw?.students ?? []);
        setTubularList(list);
      }),
      api<StudentConfig>('/api/config/students').then(setConfig),
    ]).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!config) return;
    setError('');
    setMessage('');
    try {
      await authed('/api/config/students', { method: 'PUT', body: JSON.stringify(config) });
      setMessage('Saved. Progress slide will show these students.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const addStudent = (s: TubularStudent) => {
    if (!config) return;
    const displayName = s.display_name || s.username || s.name || `Student ${s.id}`;
    if (config.students.some((x) => x.id === s.id)) return;
    setConfig({ students: [...config.students, { id: s.id, displayName }] });
  };

  const removeStudent = (id: number) => {
    if (!config) return;
    setConfig({ students: config.students.filter((x) => x.id !== id) });
  };

  const updateDisplayName = (id: number, displayName: string) => {
    if (!config) return;
    setConfig({
      students: config.students.map((x) => (x.id === id ? { ...x, displayName } : x)),
    });
  };

  const label = (s: TubularStudent) => s.display_name || s.username || s.name || `ID ${s.id}`;

  if (loading && !config) return <p>Loading…</p>;
  if (error && !config) return <p className="admin__error">{error}</p>;

  const current = config?.students ?? [];

  return (
    <section className="admin__section">
      <h2>Progress slide students</h2>
      <p>Choose which TubularTutor / TheLearningMatrix students appear on the progress slide. You can see their IDs here and add them without editing the database.</p>

      <h3>Students on progress slide</h3>
      {current.length === 0 ? (
        <p className="admin__muted">None yet. Add from the list below.</p>
      ) : (
        <ul className="admin__list">
          {current.map((s) => (
            <li key={s.id}>
              <span className="admin__progress-id">ID {s.id}</span>
              <input
                value={s.displayName ?? ''}
                onChange={(e) => updateDisplayName(s.id, e.target.value)}
                placeholder="Display name"
              />
              <button type="button" onClick={() => removeStudent(s.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      <h3>All students from TubularTutor</h3>
      {tubularList.length === 0 ? (
        <p className="admin__muted">No students returned. Check TUBULAR_TUTOR_ADMIN_TOKEN and that TubularTutor is running.</p>
      ) : (
        <ul className="admin__list">
          {tubularList.map((s) => (
            <li key={s.id}>
              <span className="admin__progress-id">ID {s.id}</span>
              <span>{label(s)}</span>
              {current.some((c) => c.id === s.id) ? (
                <span className="admin__message">On slide</span>
              ) : (
                <button type="button" onClick={() => addStudent(s)}>Add to slide</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={load}>Refresh list</button>
      <button type="button" onClick={save} disabled={!config}>Save</button>
      {message && <span className="admin__message">{message}</span>}
      {error && <span className="admin__error">{error}</span>}
    </section>
  );
}

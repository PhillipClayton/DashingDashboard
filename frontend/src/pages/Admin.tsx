export default function Admin() {
  return (
    <main className="todo-editor">
      <header className="todo-editor__header">
        <div>
          <h1>Personal dashboard</h1>
          <p>Manage your personal lists from this device or another device on your home network.</p>
        </div>
        <a href="/">View dashboard</a>
      </header>
      <section className="admin__section">
        <h2>Edit your lists</h2>
        <p>Sign in with your dashboard admin password when prompted. Changes are shared with the dashboard.</p>
        <div className="todo-editor__actions">
          <a className="admin__button-link" href="/todo">Edit To Do list</a>
          <a className="admin__button-link" href="/shopping">Edit Shopping list</a>
        </div>
      </section>
    </main>
  );
}

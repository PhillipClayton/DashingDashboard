import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Todo from './pages/Todo';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/todo" element={<Todo />} />
    </Routes>
  );
}

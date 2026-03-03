import { useEffect, useState } from 'react';
import { api, type ProjectsData } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';

export default function SlideProjects() {
  const [data, setData] = useState<ProjectsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTick = useRefreshTick();

  useEffect(() => {
    api<ProjectsData>('/api/projects')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [refreshTick]);

  if (error) return <div className="slide__error">{error}</div>;
  if (!data) return <div className="slide__loading">Loading projects…</div>;

  const projects = data.projects ?? [];
  if (projects.length === 0) return <div className="slide__empty">No home improvement projects yet.</div>;

  return (
    <div className="slide__content slide-projects">
      <h2 className="slide__title">Home improvement</h2>
      <ul className="slide-projects__list">
        {projects.map((project) => (
          <li key={project.id} className="slide-projects__item">
            {project.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

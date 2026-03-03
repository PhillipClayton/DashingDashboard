import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

ChartJS.register(TimeScale, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
import { api, type StudentConfig, type ProgressRecord, type Course } from '../../api';
import { useRefreshTick } from '../../contexts/RefreshContext';

const ON_TRACK_START = new Date('2025-08-13T00:00:00Z').getTime();
const ON_TRACK_END = new Date('2026-05-22T00:00:00Z').getTime();

type StudentProgress = {
  studentId: number;
  displayName: string;
  progress: ProgressRecord[];
  courses: Course[];
};

function buildDatasets(progress: ProgressRecord[], courses: Course[]) {
  const byCourse: Record<number, { name: string; color: string; points: { x: number; y: number }[] }> = {};
  courses.forEach((c) => {
    byCourse[c.id] = { name: c.name, color: c.color || '#666', points: [] };
  });
  progress.forEach((p) => {
    if (byCourse[p.course_id]) {
      byCourse[p.course_id].points.push({
        x: new Date(p.recorded_at).getTime(),
        y: parseFloat(String(p.percentage)),
      });
    }
  });
  const datasets = Object.entries(byCourse).map(([, d]) => ({
    label: d.name,
    data: d.points.sort((a, b) => a.x - b.x),
    borderColor: d.color,
    backgroundColor: d.color + '20',
    fill: false,
    tension: 0.2,
  }));
  const onTrack = {
    label: 'On track (target)',
    data: [
      { x: ON_TRACK_START, y: 0 },
      { x: ON_TRACK_END, y: 100 },
    ],
    borderColor: '#999',
    backgroundColor: 'transparent',
    borderDash: [5, 5],
    fill: false,
    pointRadius: 0,
    tension: 0,
  };
  (datasets as unknown[]).push(onTrack);
  return { datasets };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time' as const,
      time: { unit: 'month' as const },
      title: { display: true, text: 'Date' },
    },
    y: {
      min: 0,
      max: 100,
      title: { display: true, text: 'Completion %' },
    },
  },
};

function ProgressChart({
  displayName,
  progress,
  courses,
}: {
  displayName: string;
  progress: ProgressRecord[];
  courses: Course[];
}) {
  const chartData = buildDatasets(progress, courses);
  return (
    <div className="slide-progress__chart-wrap">
      <h3 className="slide-progress__chart-title">{displayName}</h3>
      <div className="slide-progress__chart">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default function SlideProgress() {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const refreshTick = useRefreshTick();

  useEffect(() => {
    api<StudentConfig>('/api/config/students')
      .then(async (config) => {
        const list = config.students ?? [];
        if (list.length === 0) {
          setStudents([]);
          return;
        }
        const results = await Promise.all(
          list.map(async (s) => {
            const [progress, courses] = await Promise.all([
              api<ProgressRecord[]>(`/api/students/${s.id}/progress`),
              api<Course[]>(`/api/students/${s.id}/courses`),
            ]);
            return {
              studentId: s.id,
              displayName: s.displayName ?? `Student ${s.id}`,
              progress,
              courses,
            };
          })
        );
        setStudents(results);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [refreshTick]);

  if (error) return <div className="slide__error">{error}</div>;
  if (students.length === 0) return <div className="slide__empty">No students configured for progress.</div>;

  return (
    <div className="slide__content slide-progress">
      <h2 className="slide__title">Progress</h2>
      <div className="slide-progress__grid">
        {students.map((s) => (
          <ProgressChart
            key={s.studentId}
            displayName={s.displayName}
            progress={s.progress}
            courses={s.courses}
          />
        ))}
      </div>
    </div>
  );
}

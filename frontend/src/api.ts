const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const data = JSON.parse(text);
      msg = data?.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export function apiWithAuth(token: string) {
  return function <T>(path: string, options?: RequestInit): Promise<T> {
    return api<T>(path, {
      ...options,
      headers: { ...options?.headers, Authorization: `Bearer ${token}` },
    });
  };
}

// Types for API responses
export interface ChoresData {
  people?: Array<{ id: string; name: string; tasks?: string[] }>;
}

export interface SchoolworkStudent {
  id: string;
  name: string;
  items: Array<{ id: string; label: string }>;
}
export interface SchoolworkData {
  students: SchoolworkStudent[];
}

export interface ShoppingItem {
  id: string;
  label: string;
  checked: boolean;
}
export interface ShoppingData {
  items: ShoppingItem[];
}

export interface ProjectsData {
  projects: Array<{ id: string; label: string }>;
}

export interface WeatherData {
  current?: { temp?: number; humidity?: number; weatherCode?: number };
  daily?: { date?: string; tempMax?: number; tempMin?: number; precipChance?: number };
}

export interface JokeData {
  setup?: string;
  delivery?: string;
  title?: string;
}

export interface WordData {
  word: string;
  definition: string;
  example: string;
}

export interface ProgressRecord {
  id: number;
  student_id: number;
  course_id: number;
  percentage: number;
  recorded_at: string;
  course_name?: string;
  course_color?: string;
}

export interface Course {
  id: number;
  name: string;
  color?: string;
}

export interface StudentConfig {
  students: Array<{ id: number; displayName?: string }>;
}

/** From TubularTutor /students API (shape may vary) */
export interface TubularStudent {
  id: number;
  username?: string;
  display_name?: string;
  name?: string;
}

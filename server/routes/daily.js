import { Router } from 'express';

const router = Router();
const DAILY_CACHE = new Map();

const FACT_FALLBACKS = [
  'A group of flamingos is called a flamboyance.',
  'The Eiffel Tower can grow taller in hot weather as its metal expands.',
  'Octopuses have three hearts.',
];
const QUOTE_FALLBACKS = [
  { quote: 'The unexamined life is not worth living.', author: 'Socrates' },
  { quote: 'Wonder is the beginning of wisdom.', author: 'Socrates' },
  { quote: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
];
const PUZZLE_FALLBACKS = [
  { question: 'What has keys but cannot open locks?', answer: 'A piano.' },
  { question: 'If you have me, you want to share me. If you share me, you no longer have me. What am I?', answer: 'A secret.' },
  { question: 'What number comes next: 1, 1, 2, 3, 5, 8, …?', answer: '13. Each term is the sum of the two before it.' },
];
const MATH_TOPICS = [
  'Bayes_theorem', 'Cantor_set', 'Euler_characteristic', 'Fourier_transform',
  'Gödel%27s_incompleteness_theorems', 'Group_theory', 'Hilbert_space',
  ' irrational_number', 'Lagrange_multiplier', 'Markov_chain', 'Noether%27s_theorem',
  'P-adic_number', 'Riemann_hypothesis', 'Topology', 'Turing_machine',
  'Zeta_function', 'Eigenvalues_and_eigenvectors', 'Game_theory',
  'Information_theory', 'Non-Euclidean_geometry',
];

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dailyIndex(date, length) {
  let hash = 0;
  for (const char of date) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % length;
}

function decodeHtml(value = '') {
  return value
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Daily content source returned ${response.status}`);
  return response.json();
}

async function cachedForToday(name, fetcher, fallback) {
  const key = `${name}:${dayKey()}`;
  if (DAILY_CACHE.has(key)) return DAILY_CACHE.get(key);
  let data;
  try {
    data = await fetcher();
  } catch (error) {
    console.warn(`${name} source unavailable; using fallback:`, error.message);
    data = fallback;
  }
  DAILY_CACHE.clear();
  DAILY_CACHE.set(key, data);
  return data;
}

router.get('/fact', async (_req, res) => {
  const date = dayKey();
  const fallback = { text: FACT_FALLBACKS[dailyIndex(date, FACT_FALLBACKS.length)], source: 'Local fallback', sourceUrl: '' };
  res.json(await cachedForToday('fact', async () => {
    const raw = await getJson('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    if (!raw.text) throw new Error('Fact response was empty');
    return { text: raw.text, source: 'Useless Facts', sourceUrl: 'https://uselessfacts.jsph.pl/' };
  }, fallback));
});

router.get('/quote', async (_req, res) => {
  const date = dayKey();
  const fallback = { ...QUOTE_FALLBACKS[dailyIndex(date, QUOTE_FALLBACKS.length)], source: 'Local fallback', sourceUrl: '' };
  res.json(await cachedForToday('quote', async () => {
    const raw = await getJson('https://zenquotes.io/api/today');
    if (!Array.isArray(raw) || !raw[0]?.q || !raw[0]?.a) throw new Error('Quote response was empty');
    return { quote: raw[0].q, author: raw[0].a, source: 'ZenQuotes', sourceUrl: 'https://zenquotes.io/' };
  }, fallback));
});

router.get('/puzzle', async (_req, res) => {
  const date = dayKey();
  const fallback = { ...PUZZLE_FALLBACKS[dailyIndex(date, PUZZLE_FALLBACKS.length)], source: 'Local fallback', sourceUrl: '' };
  res.json(await cachedForToday('puzzle', async () => {
    const raw = await getJson('https://opentdb.com/api.php?amount=1&category=19&type=multiple');
    const item = raw.results?.[0];
    if (!item?.question || !item?.correct_answer) throw new Error('Puzzle response was empty');
    return {
      question: decodeHtml(item.question),
      answer: decodeHtml(item.correct_answer),
      source: 'Open Trivia Database',
      sourceUrl: 'https://opentdb.com/',
    };
  }, fallback));
});

router.get('/math', async (_req, res) => {
  const date = dayKey();
  const topic = MATH_TOPICS[dailyIndex(date, MATH_TOPICS.length)].replace(/^ /, '');
  const fallback = {
    title: 'A mathematical idea',
    text: 'Mathematics studies patterns and structures. Explore a new idea each day, from symmetry and infinity to probability and geometry.',
    source: 'Local fallback', sourceUrl: '',
  };
  res.json(await cachedForToday('math', async () => {
    const raw = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`);
    if (!raw.extract) throw new Error('Math summary was empty');
    return {
      title: raw.title,
      text: raw.extract.length > 650 ? `${raw.extract.slice(0, 647).trimEnd()}…` : raw.extract,
      source: 'Wikipedia',
      sourceUrl: raw.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${topic}`,
    };
  }, fallback));
});

export default router;

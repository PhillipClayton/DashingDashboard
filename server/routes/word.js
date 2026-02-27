import { Router } from 'express';

const router = Router();
const CACHE_KEY = () => new Date().toISOString().slice(0, 10);
let cache = { key: null, data: null };

// Free API: Random Words API (no key) or fallback to a static list
const FALLBACK_WORDS = [
  { word: 'serendipity', definition: 'The occurrence of events by chance in a happy way.', example: 'Meeting you was pure serendipity.' },
  { word: 'ephemeral', definition: 'Lasting for a very short time.', example: 'Fame can be ephemeral.' },
  { word: 'resilient', definition: 'Able to withstand or recover quickly from difficulty.', example: 'Children are often remarkably resilient.' },
];

router.get('/', async (req, res) => {
  const key = CACHE_KEY();
  if (cache.key === key && cache.data) {
    return res.json(cache.data);
  }
  try {
    const resp = await fetch('https://random-word-api.herokuapp.com/word');
    if (!resp.ok) throw new Error('Word API error');
    const [word] = await resp.json();
    if (!word) throw new Error('No word');
    const defResp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    let definition = '';
    let example = '';
    if (defResp.ok) {
      const entries = await defResp.json();
      const first = entries[0];
      if (first?.meanings?.[0]?.definitions?.[0]) {
        definition = first.meanings[0].definitions[0].definition || '';
        example = first.meanings[0].definitions[0].example || '';
      }
    }
    if (!definition) definition = '(definition not found)';
    const data = { word, definition, example };
    cache = { key, data };
    res.json(data);
  } catch {
    const one = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)];
    cache = { key, data: one };
    res.json(one);
  }
});

export default router;

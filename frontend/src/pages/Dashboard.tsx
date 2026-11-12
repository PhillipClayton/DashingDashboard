import { useEffect, useState } from 'react';
import Carousel from '../components/Carousel';
import { RefreshProvider } from '../contexts/RefreshContext';
import { api } from '../api';
import SlideTodo from '../components/slides/SlideTodo';
import SlideSchoolwork from '../components/slides/SlideSchoolwork';
import SlideProgress from '../components/slides/SlideProgress';
import SlideShopping from '../components/slides/SlideShopping';
import SlideProjects from '../components/slides/SlideProjects';
import SlideWeather from '../components/slides/SlideWeather';
import SlideJoke from '../components/slides/SlideJoke';
import SlideWord from '../components/slides/SlideWord';
import SlideDaily from '../components/slides/SlideDaily';

const SLIDE_INTERVAL_MS = 25000;
const baseSlides = [
  { id: 'todo', title: 'To Do', Component: SlideTodo },
  { id: 'schoolwork', title: 'Schoolwork', Component: SlideSchoolwork },
  { id: 'shopping', title: 'Shopping', Component: SlideShopping },
  { id: 'projects', title: 'Home improvement', Component: SlideProjects },
  { id: 'weather', title: 'Weather', Component: SlideWeather },
  { id: 'joke', title: 'Joke', Component: SlideJoke },
  { id: 'word', title: 'Word of the day', Component: SlideWord },
  { id: 'fact', title: 'Daily fact', Component: () => <SlideDaily kind="fact" /> },
  { id: 'quote', title: 'Philosophy quote', Component: () => <SlideDaily kind="quote" /> },
  { id: 'puzzle', title: 'Brain teaser', Component: () => <SlideDaily kind="puzzle" /> },
  { id: 'math', title: 'Math concept', Component: () => <SlideDaily kind="math" /> },
];

export default function Dashboard() {
  const [index, setIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const slides = showProgress
    ? [...baseSlides, { id: 'progress', title: 'Progress', Component: SlideProgress }]
    : baseSlides;

  useEffect(() => {
    api<{ tubularTutorEnabled?: boolean }>('/api/dashboard-config')
      .then((config) => setShowProgress(Boolean(config.tubularTutorEnabled)))
      .catch(() => setShowProgress(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  return (
    <RefreshProvider>
      <div className="dashboard">
        <Carousel
          currentIndex={index}
          total={slides.length}
          onSelect={setIndex}
          onTrackClick={() => setIndex((prev) => (prev + 1) % slides.length)}
        >
          {slides.map(({ id, Component }, i) => (
            <div key={id} className="slide" data-active={i === index} aria-hidden={i !== index}>
              <Component />
            </div>
          ))}
        </Carousel>
      </div>
    </RefreshProvider>
  );
}

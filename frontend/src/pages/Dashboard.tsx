import { useEffect, useState } from 'react';
import Carousel from '../components/Carousel';
import { RefreshProvider } from '../contexts/RefreshContext';
import SlideTodo from '../components/slides/SlideTodo';
import SlideShopping from '../components/slides/SlideShopping';
import SlideWeather from '../components/slides/SlideWeather';
import SlideJoke from '../components/slides/SlideJoke';
import SlideWord from '../components/slides/SlideWord';

const SLIDE_INTERVAL_MS = 25000;
const slides = [
  { id: 'todo', Component: SlideTodo },
  { id: 'shopping', Component: SlideShopping },
  { id: 'weather', Component: SlideWeather },
  { id: 'joke', Component: SlideJoke },
  { id: 'word', Component: SlideWord },
];

export default function Dashboard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <RefreshProvider>
      <div className="dashboard">
        <Carousel
          currentIndex={index}
          total={slides.length}
          onSelect={setIndex}
          onTrackClick={() => setIndex((current) => (current + 1) % slides.length)}
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

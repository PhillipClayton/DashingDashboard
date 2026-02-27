import { useEffect, useState } from 'react';
import Carousel from '../components/Carousel';
import SlideChores from '../components/slides/SlideChores';
import SlideSchoolwork from '../components/slides/SlideSchoolwork';
import SlideProgress from '../components/slides/SlideProgress';
import SlideShopping from '../components/slides/SlideShopping';
import SlideWeather from '../components/slides/SlideWeather';
import SlideJoke from '../components/slides/SlideJoke';
import SlideWord from '../components/slides/SlideWord';

const SLIDE_INTERVAL_MS = 25000;

const slides = [
  { id: 'chores', title: 'Chores', Component: SlideChores },
  { id: 'schoolwork', title: 'Schoolwork', Component: SlideSchoolwork },
  { id: 'progress', title: 'Progress', Component: SlideProgress },
  { id: 'shopping', title: 'Shopping', Component: SlideShopping },
  { id: 'weather', title: 'Weather', Component: SlideWeather },
  { id: 'joke', title: 'Joke', Component: SlideJoke },
  { id: 'word', title: 'Word of the day', Component: SlideWord },
];

export default function Dashboard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="dashboard">
      <Carousel
        currentIndex={index}
        total={slides.length}
        onSelect={setIndex}
      >
        {slides.map(({ id, Component }, i) => (
          <div
            key={id}
            className="slide"
            data-active={i === index}
            aria-hidden={i !== index}
          >
            <Component />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

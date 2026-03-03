import type { ReactNode } from 'react';

type Props = {
  currentIndex: number;
  total: number;
  onSelect?: (index: number) => void;
  children: ReactNode;
};

export default function Carousel({ currentIndex, total, onSelect, children }: Props) {
  return (
    <div className="carousel">
      <div
        className="carousel__track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {children}
      </div>
      <div className="carousel__dots" aria-label="Slide navigation">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`carousel__dot ${i === currentIndex ? 'carousel__dot--active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}

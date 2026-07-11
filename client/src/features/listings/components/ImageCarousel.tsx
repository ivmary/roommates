import { useState } from "react";
import "./styles/ImageCarousel.css";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : ["/no-photo.svg"];

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div className="carousel">
      <div className="carousel-viewport">
        <img
          src={slides[index]}
          alt={`${alt} photo ${index + 1}`}
          className="carousel-img"
        />
        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="carousel-nav carousel-nav--prev"
              onClick={prev}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-nav carousel-nav--next"
              onClick={next}
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`carousel-dot ${i === index ? "carousel-dot--active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

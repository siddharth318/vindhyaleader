"use client";

import { Children, useEffect, useState, type ReactNode } from "react";

// Slide animation length; added to each slide's duration so it counts time fully on screen.
const SLIDE_MS = 500;

/**
 * Auto-rotating ad slot: slides horizontally between its children. `durations[i]` is how
 * long slide i stays on screen (falls back to `intervalMs`).
 * All slides share the height of the tallest one (normally the image creative), so the
 * page never jumps. Pauses while hovered/focused; no slide animation for reduced motion.
 */
export default function AdCarousel({
  children,
  intervalMs = 5000,
  durations = [],
}: {
  children: ReactNode;
  intervalMs?: number;
  durations?: number[];
}) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), (durations[index] ?? intervalMs) + SLIDE_MS);
    return () => clearTimeout(id);
    // durations is compared by value so an inline array literal doesn't restart the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, slides.length, intervalMs, index, durations.join()]);

  return (
    <div
      className="relative overflow-hidden rounded-md"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="flex transition-transform ease-in-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)`, transitionDuration: `${SLIDE_MS}ms` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="flex w-full shrink-0"
            aria-roledescription="slide"
            aria-hidden={i !== index}
            inert={i !== index}
          >
            {slide}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`विज्ञापन ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full shadow transition-all md:h-2 ${
                i === index ? "w-4 bg-white md:w-5" : "w-1.5 bg-white/60 md:w-2"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

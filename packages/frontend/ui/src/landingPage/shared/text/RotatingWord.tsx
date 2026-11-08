"use client";
import { useEffect, useState } from "react";

/* eslint-disable-next-line */
export interface RotatingWordProps {
  words: string[];
  interval?: number;
  className?: string;
}

// Cycles through `words`, fading/sliding each one in. All words share one
// grid cell so the width stays constant and the headline never jumps.
export const RotatingWord = ({
  words,
  interval = 2000,
  className = "",
}: RotatingWordProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      interval
    );
    return () => clearInterval(id);
  }, [words.length, interval]);

  const previous = (index - 1 + words.length) % words.length;

  return (
    <span className={`inline-grid justify-items-center align-bottom ${className}`}>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== index}
          className={`[grid-area:1/1] transition-all duration-700 ease-out motion-reduce:transition-none ${
            i === index
              ? "opacity-100 translate-y-0 blur-0"
              : i === previous
              ? "opacity-0 -translate-y-3 blur-sm"
              : "opacity-0 translate-y-3 blur-sm"
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

export default RotatingWord;

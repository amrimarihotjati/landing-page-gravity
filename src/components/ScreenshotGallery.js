"use client";

import { useState, useEffect, useRef } from "react";
import s from "./ScreenshotGallery.module.css";

export default function ScreenshotGallery({ screenshots, appName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (isPaused || screenshots.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % screenshots.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, screenshots.length]);

  // Scroll to active thumbnail
  useEffect(() => {
    if (!scrollRef.current) return;
    const thumbs = scrollRef.current.children;
    if (thumbs[activeIndex]) {
      thumbs[activeIndex].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div
      className={s.gallery}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Preview */}
      <div className={s.preview}>
        <img
          src={screenshots[activeIndex]}
          alt={`${appName} screenshot ${activeIndex + 1}`}
          className={s.previewImg}
        />
        <div className={s.counter}>
          {activeIndex + 1} / {screenshots.length}
        </div>
      </div>

      {/* Thumbnails */}
      {screenshots.length > 1 && (
        <div className={s.thumbStrip} ref={scrollRef}>
          {screenshots.map((src, i) => (
            <button
              key={i}
              className={`${s.thumb} ${i === activeIndex ? s.thumbActive : ""}`}
              onClick={() => setActiveIndex(i)}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                className={s.thumbImg}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

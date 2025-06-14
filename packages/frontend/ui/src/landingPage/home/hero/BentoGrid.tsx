"use client";

import BentoCard, { BentoCardProps } from "./BentoCard";
import React, { useMemo, useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ------------------------------------------------------------------
 * Type definitions
 * ----------------------------------------------------------------*/
export interface BentoItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  /** grid rows the card should occupy (1‑3) */
  rowSpan?: 1 | 2 | 3;
  /** grid columns the card should occupy (1‑2) */
  colSpan?: 1 | 2;
  button: {
    link: string;
    text: string;
  };
}

/* ------------------------------------------------------------------
 * Core component: <BentoGrid>
 * ------------------------------------------------------------------
 *
 * Bento Grid container with two columns and three rows per column.
 * One column scrolls infinitely using SwiperJS.
 * Props:
 * - items: array of items with keys { image, title, description?, rowSpan, colSpan }
 *   items should be divided into two arrays: leftCol and rightCol.
 */
/* eslint-disable-next-line */
export interface BentoGridProps {
  items: BentoItem[];
  /** autoplay delay in ms; defaults to 4 s */
  autoplayDelay?: number;
}

/* Constants --------------------------------------------------------------*/
const MAX_ROWS = 3;
const MAX_COLS = 2;
const GRID_CAPACITY = MAX_ROWS * MAX_COLS; // 6 cells

export const BentoGrid = (props: BentoGridProps) => {
  const { items = [], autoplayDelay = 4000 } = props;

  const progressCircle = useRef<any>(null);
  const progressContent = useRef<any>(null);
  const onAutoplayTimeLeft = (s: any, time: any, progress: any) => {
    progressCircle.current.style.setProperty("--progress", 1 - progress);
    progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
  };

  // Bucket items until the cell‑area limit (6) would be exceeded.
  const slides = useMemo(() => {
    const out: BentoItem[][] = [];
    let bucket: BentoItem[] = [];
    let bucketArea = 0;

    const flush = () => {
      if (bucket.length) {
        out.push(bucket);
        bucket = [];
        bucketArea = 0;
      }
    };

    items.forEach((item) => {
      const area = (item.rowSpan || 1) * (item.colSpan || 1);
      if (area > GRID_CAPACITY) return; // skip impossible items

      if (bucketArea + area > GRID_CAPACITY) flush();
      bucket.push(item);
      bucketArea += area;
    });
    flush();

    // Duplicate for seamless looping
    return [...out, ...out];
  }, [items]);

  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      slidesPerView={1} // always one 2×3 grid per viewport
      loop
      autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
      pagination={{
        clickable: true,
        bulletClass: "swiper-pagination-bullet !bg-synergy-light-blue",
        bulletActiveClass: "swiper-pagination-bullet-active !bg-synergy-light-blue",
      }}
      navigation={{
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      }}
      className="w-full"
      spaceBetween={16}
      onAutoplayTimeLeft={onAutoplayTimeLeft}
        >
      {slides.map((slideItems, idx) => (
        <SwiperSlide key={idx} className="w-full">
          <div className="grid grid-cols-2 grid-rows-3 gap-4 h-[70vh]">
            {slideItems.map((item) => (
              <BentoCard key={item.id} {...item} />
            ))}
          </div>
        </SwiperSlide>
      ))}
      {/* Navigation buttons */}
      <button
        className="swiper-button-prev !text-synergy-light-blue !fill-synergy-light-blue"
        aria-label="Previous slide"
        type="button"
      ></button>
      <button
        className="swiper-button-next !text-synergy-light-blue !fill-synergy-light-blue"
        aria-label="Next slide"
        type="button"
      ></button>
      <div
        className="autoplay-progress absolute right-4 bottom-4 w-12 h-12 flex items-center justify-center z-10 font-bold text-synergy-light-blue"
        slot="container-end"
      >
        <svg
          viewBox="0 0 48 48"
          ref={progressCircle}
          className="absolute left-0 top-0 z-10 w-full h-full stroke-synergy-light-blue"
          style={{
            strokeWidth: 4,
            fill: "none",
            strokeDashoffset: "calc(125.6px * (1 - var(--progress)))",
            strokeDasharray: "125.6",
            transform: "rotate(-90deg)",
          }}
        >
          <circle cx="24" cy="24" r="20"></circle>
        </svg>
        <span ref={progressContent}></span>
      </div>
    </Swiper>
  );
};

export default BentoGrid;

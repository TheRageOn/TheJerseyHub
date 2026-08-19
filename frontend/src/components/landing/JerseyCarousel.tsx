"use client";

import React from "react";
import Image from "next/image";
import { Jersey } from "@/data/jerseys";

interface JerseyCarouselProps {
  jerseys: Jersey[];
  selectedJersey: Jersey;
  onSelectJersey: (jersey: Jersey) => void;
}

export default function JerseyCarousel({
  jerseys,
  selectedJersey,
  onSelectJersey,
}: JerseyCarouselProps) {
  const currentIndex = jerseys.findIndex((j) => j.id === selectedJersey.id);

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + jerseys.length) % jerseys.length;
    onSelectJersey(jerseys[prevIndex]);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % jerseys.length;
    onSelectJersey(jerseys[nextIndex]);
  };

  return (
    <div className="flex flex-col gap-5 items-end pointer-events-auto select-none">
      {/* Cards Container */}
      <div className="flex gap-4">
        {jerseys.map((jersey) => {
          const isSelected = jersey.id === selectedJersey.id;
          return (
            <div
              key={jersey.id}
              onClick={() => onSelectJersey(jersey)}
              className={`jersey-card relative w-[135px] pt-20 pb-4 px-3 rounded-[28px] flex flex-col items-center gap-4 cursor-pointer text-center ${
                isSelected ? "active" : ""
              }`}
            >
              {/* Product Thumbnail with dramatic jump hover */}
              <div className="relative w-[140px] h-[140px] -mt-32 transition-transform duration-500 ease-out group-hover:-translate-y-6 drop-shadow-[0_20px_35px_rgba(0,0,0,0.4)]">
                <Image
                  src={jersey.imageSrc}
                  alt={jersey.name}
                  fill
                  sizes="140px"
                  className="object-contain pointer-events-none transition-transform duration-500 hover:-translate-y-4 hover:-rotate-6 hover:scale-110"
                />
              </div>

              {/* Minimal Card Text */}
              <div className="flex flex-col text-[11px] leading-tight w-full">
                <span className="font-semibold text-white truncate">
                  {jersey.name}
                </span>
                <span className="text-white/70 font-medium text-[10px] mt-0.5">
                  {jersey.price}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sleek Arrow Controls */}
      <div className="flex gap-3 pr-1">
        <button
          onClick={handlePrev}
          aria-label="Previous"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm transition-all active:scale-95 cursor-pointer"
        >
          ←
        </button>
        <button
          onClick={handleNext}
          aria-label="Next"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm transition-all active:scale-95 cursor-pointer"
        >
          →
        </button>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Jersey } from "@/data/jerseys";
import JerseyCarousel from "./JerseyCarousel";
import FloatingElements from "./FloatingElements";

interface HeroSectionProps {
  jerseys: Jersey[];
  selectedJersey: Jersey;
  onSelectJersey: (jersey: Jersey) => void;
  mousePos: { x: number; y: number; px: number; py: number };
}

export default function HeroSection({
  jerseys,
  selectedJersey,
  onSelectJersey,
  mousePos,
}: HeroSectionProps) {
  const heroImageRef = useRef<HTMLDivElement>(null);


  // Subtle 3D tilt tracking cursor
  useEffect(() => {
    if (heroImageRef.current) {
      const tiltX = mousePos.y * -16;
      const tiltY = mousePos.x * 20;
      heroImageRef.current.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1)`;
    }
  }, [mousePos]);

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-between px-8 lg:px-14 pt-20">
      {/* Floating Parallax Background Elements */}
      <FloatingElements mousePos={mousePos} />

      {/* 3-Column Minimalist Hero Layout */}
      <div className="relative z-20 w-full h-full flex items-center justify-between">
        
        {/* LEFT COLUMN: Clean Minimal Typography */}
        <div className="flex flex-col justify-between h-full py-12 z-20 max-w-sm pointer-events-none">
          <div className="flex flex-col gap-6 pointer-events-auto">
            {/* Minimalist Roxborough CF Headline */}
            <h1 className="font-display text-7xl sm:text-8xl lg:text-[7.5rem] leading-[0.82] text-white tracking-normal select-none">
              <span>Pure</span>
              <br />
              <span className="opacity-95">Match</span>
            </h1>

            {/* Clean 2-Line Description */}
            <p className="text-sm text-white/80 leading-relaxed font-normal">
              Experience the authentic match-issue kit. Crafted for performance, worn by icons.
            </p>

            {/* Minimal Primary Button */}
            <div>
              <button className="flex items-center gap-5 pl-6 pr-2 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white font-semibold text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                Shop Now
                <div className="w-8 h-8 rounded-full bg-white text-[#f26419] flex items-center justify-center font-bold text-sm">
                  +
                </div>
              </button>
            </div>
          </div>

          {/* Minimal Award Badge */}
          <div className="flex items-center gap-3.5 pointer-events-auto pt-8">
            <div className="w-11 h-11 rounded-2xl glass-capsule flex items-center justify-center text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15l3 3 4-4" />
                <path d="M7 10l5 5 5-5" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                AUTHENTIC SPEC
              </span>
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                MATCH EDITION 2025
              </span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Hero Floating Cutout Product */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            ref={heroImageRef}
            className="relative w-[340px] sm:w-[460px] md:w-[540px] lg:w-[620px] h-[340px] sm:h-[460px] md:h-[540px] lg:h-[620px] hero-float-anim transition-transform duration-300 ease-out drop-shadow-[0_30px_50px_rgba(0,0,0,0.35)]"
          >
            <Image
              key={selectedJersey.id}
              src={selectedJersey.imageSrc}
              alt={selectedJersey.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 620px"
              className="object-contain transition-opacity duration-700 animate-in fade-in zoom-in-95"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Jersey Carousel & Side Title */}
        <div className="flex flex-col justify-between items-end h-full py-12 z-20 pointer-events-none text-right">
          {/* Glass Card Carousel */}
          <JerseyCarousel
            jerseys={jerseys}
            selectedJersey={selectedJersey}
            onSelectJersey={onSelectJersey}
          />

          {/* Minimal Side Headline */}
          <div className="pointer-events-auto flex flex-col items-end">
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[0.85] tracking-normal select-none">
              <span>Authentic</span>
              <br />
              <span className="opacity-95">Kit</span>
            </h2>
          </div>
        </div>

      </div>
    </section>
  );
}


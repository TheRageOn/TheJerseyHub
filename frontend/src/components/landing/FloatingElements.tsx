"use client";

import React, { useEffect, useRef } from "react";

interface FloatingElementsProps {
  mousePos: { x: number; y: number; px: number; py: number };
}

export default function FloatingElements({ mousePos }: FloatingElementsProps) {
  const fgRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fgRef.current && bgRef.current) {
      fgRef.current.style.transform = `translate3d(${mousePos.x * 40}px, ${
        mousePos.y * 40
      }px, 0)`;
      bgRef.current.style.transform = `translate3d(${mousePos.x * -20}px, ${
        mousePos.y * -20
      }px, 0)`;
    }
  }, [mousePos]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background Parallax Layer */}
      <div
        ref={bgRef}
        className="absolute inset-0 transition-transform duration-700 ease-out"
      >
        {/* Faint Floating Star Accent */}
        <div className="absolute top-[15%] left-[12%] opacity-20 text-white w-14 h-14">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>

        {/* Floating Ring Motif */}
        <div className="absolute bottom-[20%] right-[18%] opacity-15 text-white w-20 h-20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      </div>

      {/* Foreground Parallax Layer */}
      <div
        ref={fgRef}
        className="absolute inset-0 transition-transform duration-500 ease-out"
      >
        {/* Floating Diamond Accent */}
        <div className="absolute top-[28%] right-[28%] opacity-25 text-white w-8 h-8">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" transform="rotate(45 12 12)" />
          </svg>
        </div>

        {/* Small floating cross */}
        <div className="absolute bottom-[30%] left-[24%] opacity-20 text-white w-7 h-7">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}


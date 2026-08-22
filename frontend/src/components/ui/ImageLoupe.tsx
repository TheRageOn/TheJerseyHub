"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/imageUtils";

interface ImageLoupeProps {
  src: string;
  alt: string;
  zoomLevel?: number; // Magnification factor (default: 2.5)
  loupeSize?: number; // Diameter in pixels (default: 150)
  className?: string;
}

export default function ImageLoupe({
  src,
  alt,
  zoomLevel = 2.5,
  loupeSize = 150,
  className = "",
}: ImageLoupeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, relX: 0, relY: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ensure inside boundaries
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        setIsActive(false);
        return;
      }

      setIsActive(true);
      const relX = (x / rect.width) * 100;
      const relY = (y / rect.height) * 100;
      setPos({ x, y, relX, relY });
    },
    []
  );

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  const safeSrc = getSafeImageSrc(src);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none cursor-crosshair overflow-hidden group ${className}`}
    >
      {/* Base Jersey Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={safeSrc}
          alt={alt}
          fill
          className="object-contain transition-transform duration-200"
          draggable={false}
        />
      </div>

      {/* Floating Circular Reticle Loupe Lens */}
      {isActive && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-[#ff5500] shadow-[0_0_25px_rgba(255,85,0,0.5),0_15px_35px_rgba(0,0,0,0.8)] z-30 overflow-hidden backdrop-blur-xs"
          style={{
            width: `${loupeSize}px`,
            height: `${loupeSize}px`,
            left: `${pos.x - loupeSize / 2}px`,
            top: `${pos.y - loupeSize / 2}px`,
          }}
        >
          {/* Zoomed Canvas Background */}
          <div
            className="absolute inset-0 bg-no-repeat bg-[#0c0c0e]"
            style={{
              backgroundImage: `url(${safeSrc})`,
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundPosition: `${pos.relX}% ${pos.relY}%`,
            }}
          />

          {/* Precision Crosshair Target */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[1px] bg-[#ff5500]/40" />
            <div className="h-full w-[1px] bg-[#ff5500]/40 absolute" />
            <div className="w-4 h-4 rounded-full border border-[#ff5500] absolute" />
          </div>

          {/* Micro HUD Tag Readout */}
          <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
            <span className="font-mono text-[8px] bg-black/80 text-[#ff5500] px-1.5 py-0.5 rounded border border-[#ff5500]/30 tracking-widest font-bold uppercase shadow-sm">
              MAG: {zoomLevel}X // CREST
            </span>
          </div>
        </div>
      )}

      {/* Subtle Bottom Hover Hint */}
      {!isActive && (
        <div className="absolute bottom-2 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="font-mono text-[9px] bg-black/70 text-white/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm shadow-md">
            [+] Hover to inspect crest & weave
          </span>
        </div>
      )}
    </div>
  );
}

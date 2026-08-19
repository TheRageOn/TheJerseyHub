"use client";

import React, { useState } from "react";

const NAV_ITEMS = [
  { label: "Home", href: "#" },
  { label: "Kits", href: "#" },
  { label: "Archive", href: "#" },
  { label: "Edition", href: "#" },
  { label: "Reviews", href: "#" },
];

export default function Navbar() {
  const [activeNav, setActiveNav] = useState("Home");

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-8 lg:px-14 py-6 flex items-center justify-between pointer-events-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 pointer-events-auto cursor-pointer">
        <svg
          className="w-7 h-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        <span className="font-display text-2xl tracking-normal text-white">
          Jersey
        </span>
      </div>

      {/* Floating Glass Nav Pill */}
      <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full glass-capsule pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-white text-[#f26419] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Contact / Action Button */}
      <div className="pointer-events-auto">
        <button className="px-6 py-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5">
          Contact Us
        </button>
      </div>
    </header>
  );
}


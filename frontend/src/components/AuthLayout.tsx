"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { JERSEYS } from "@/data/jerseys";

interface AuthLayoutProps {
  children: React.ReactNode;
  pageType: "login" | "signup";
}

export default function AuthLayout({ children, pageType }: AuthLayoutProps) {
  const [theme, setTheme] = useState<"light" | "black">("light");
  const [timeString, setTimeString] = useState("00:00:00");
  const [selectedJersey] = useState(
    () => (pageType === "login" ? JERSEYS[0] : JERSEYS[1])
  );

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "black" : "light"));
  }, []);

  // Clock tick
  useEffect(() => {
    const tick = () => setTimeString(new Date().toTimeString().split(" ")[0]);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Parallax physics on mouse move (matching Hero physics)
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const jerseyRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    let raf: number;
    const tick = () => {
      const m = mouse.current;
      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;

      if (jerseyRef.current) {
        const rY = m.x * 20;
        const rX = m.y * -15;
        const rZ = m.x * 2.5;
        const sX = m.x * -30;
        const sY = 30 + m.y * -15;
        jerseyRef.current.style.transform = `rotateY(${rY}deg) rotateX(${rX}deg) rotateZ(${rZ}deg)`;
        jerseyRef.current.style.filter = `drop-shadow(${sX}px ${sY}px 40px rgba(0,0,0,0.5)) brightness(1.04) contrast(1.04)`;
      }

      if (sheenRef.current) {
        const snX = 50 + m.x * 35;
        const snY = 50 + m.y * 35;
        sheenRef.current.style.background = `radial-gradient(circle at ${snX}% ${snY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 35%, transparent 60%)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(raf);
    };
  }, []);

  const isLight = theme === "light";
  const isSignup = pageType === "signup";

  // Dedicated Product Photography & Archive Intel Showcase
  const ArchiveShowcase = (
    <div className="relative w-full h-[520px] lg:h-[620px] xl:h-[660px] flex items-center justify-center pointer-events-none [perspective:1400px]">
      {/* 1. Coordinate Marks */}
      <div
        className={`absolute top-4 left-4 font-mono text-[10px] tracking-widest pointer-events-none ${
          isLight ? "text-black/20" : "text-white/20"
        }`}
      >
        [X]
      </div>
      <div
        className={`absolute top-4 right-4 font-mono text-[10px] tracking-widest pointer-events-none ${
          isLight ? "text-black/20" : "text-white/20"
        }`}
      >
        [X]
      </div>
      <div
        className={`absolute bottom-4 left-4 font-mono text-[10px] tracking-widest pointer-events-none ${
          isLight ? "text-black/20" : "text-white/20"
        }`}
      >
        [X]
      </div>
      <div
        className={`absolute bottom-4 right-4 font-mono text-[10px] tracking-widest pointer-events-none ${
          isLight ? "text-black/20" : "text-white/20"
        }`}
      >
        [X]
      </div>

      {/* 2. Top HUD Data Block (KIT SPECS) */}
      <div
        className={`absolute top-6 left-6 font-mono text-[9px] sm:text-[10px] tracking-[0.14em] leading-4.5 pointer-events-none ${
          isLight ? "text-[#555]" : "text-[#777]"
        }`}
      >
        <p
          className={`tracking-[0.2em] font-bold ${
            isLight ? "text-black" : "text-white"
          }`}
        >
          KIT SPECS
        </p>
        <p className={isLight ? "text-black/20" : "text-white/20"}>---------</p>
        <p className={`mt-1 ${isLight ? "text-black/80" : "text-white/90"}`}>
          SESSION : [20.08.2026]
        </p>
        <p>TIMESTAMP : [{timeString}]</p>
        <p
          className={`mt-1 font-semibold ${
            isLight ? "text-black" : "text-white"
          }`}
        >
          EDITION : [{selectedJersey.code}]
        </p>
      </div>

      {/* 3. Bottom HUD Data Block (VAULT INTEL) */}
      <div
        className={`absolute bottom-6 right-6 font-mono text-[9px] sm:text-[10px] tracking-[0.14em] leading-4.5 pointer-events-none text-right ${
          isLight ? "text-[#555]" : "text-[#777]"
        }`}
      >
        <p
          className={`tracking-[0.2em] font-bold ${
            isLight ? "text-black" : "text-white"
          }`}
        >
          VAULT INTEL
        </p>
        <p className={isLight ? "text-black/20" : "text-white/20"}>---------</p>
        <p className={`mt-1 ${isLight ? "text-black/80" : "text-white/90"}`}>
          CLUB : [{selectedJersey.club}]
        </p>
        <p className="truncate max-w-[200px]">SPEC : [{selectedJersey.name}]</p>
        <p className="mt-1 text-[#ff5500]">STATUS : [ARCHIVED / VERIFIED]</p>
      </div>

      {/* 4. Dashed Selection Framing Outline */}
      <div
        className={`absolute inset-8 sm:inset-12 border border-dashed rounded-[2px] pointer-events-none ${
          isLight ? "border-black/10" : "border-white/10"
        }`}
      />

      {/* 5. Center Floating Jersey with 3D Parallax Tilt */}
      <div
        ref={jerseyRef}
        className="relative w-[280px] h-[360px] sm:w-[340px] sm:h-[440px] xl:w-[380px] xl:h-[480px] z-20 will-change-transform flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Specular Sheen */}
        <div
          ref={sheenRef}
          className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay rounded-full opacity-40"
        />

        <Image
          src={selectedJersey.imageSrc}
          alt={selectedJersey.name}
          fill
          priority
          sizes="(max-width: 1024px) 340px, 420px"
          className="object-contain"
          draggable={false}
        />
      </div>
    </div>
  );

  return (
    <div
      className={`relative min-h-screen w-screen flex flex-col justify-between overflow-x-hidden transition-colors duration-700 select-none ${
        isLight ? "theme-light text-[#111111]" : "theme-black text-[#d0d0d0]"
      }`}
    >
      {/* Universal Film Grain Overlay */}
      <div className="film-grain" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="relative w-full z-40 px-6 sm:px-12 lg:px-20 pt-6 sm:pt-8 flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className={`font-semibold tracking-[0.2em] transition-opacity hover:opacity-75 ${
              isLight ? "text-black" : "text-white"
            }`}
          >
            [THEJERSEYHUB]
          </Link>
        </div>

        {/* Center Emblem */}
        <div className="absolute left-1/2 -translate-x-1/2 top-5 sm:top-7 hidden sm:block">
          <div
            className={`w-8 h-5 rounded-[2px] flex items-center justify-center px-1 shadow-[0_0_15px_rgba(0,0,0,0.1)] ${
              isLight ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-10">
          <button
            type="button"
            onClick={toggleTheme}
            className={`hover:opacity-100 transition-opacity cursor-pointer ${
              isLight ? "text-[#555]" : "text-[#777]"
            }`}
          >
            THEME
          </button>
          <Link
            href="/"
            className={`flex items-center gap-1.5 hover:opacity-100 transition-opacity ${
              isLight ? "text-[#555]" : "text-[#777]"
            }`}
          >
            <span>←</span>
            <span>[VAULT]</span>
          </Link>
        </div>
      </header>

      {/* ── Main Workspace ─────────────────────────────────────────── */}
      <main className="relative flex-1 w-full max-w-[1600px] mx-auto flex items-center px-4 sm:px-12 lg:px-24 xl:px-32 py-6 lg:py-12">
        {/* Coordinate Marks */}
        <div
          className={`absolute top-4 left-8 sm:left-16 lg:left-24 font-mono text-[10px] tracking-widest pointer-events-none ${
            isLight ? "text-black/20" : "text-white/20"
          }`}
        >
          [X]
        </div>
        <div
          className={`absolute bottom-4 left-8 sm:left-16 lg:left-24 font-mono text-[10px] tracking-widest pointer-events-none ${
            isLight ? "text-black/20" : "text-white/20"
          }`}
        >
          [X]
        </div>

        {/* 
          Grid layout with direction flip:
          - Login: Form on Left (with right inset), Jersey Showcase on Right
          - Signup: Jersey Showcase on Left, Form on Right (with left inset)
        */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-center">
          {isSignup ? (
            <>
              {/* Signup: Showcase on Left */}
              <div className="hidden lg:block lg:col-span-7">{ArchiveShowcase}</div>
              {/* Signup: Form on Right */}
              <div className="lg:col-span-5 w-full flex justify-center lg:justify-end z-30">
                <div className="w-full max-w-[420px] lg:mr-8 xl:mr-16">
                  {children}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Login: Form on Left */}
              <div className="lg:col-span-5 w-full flex justify-center lg:justify-start z-30">
                <div className="w-full max-w-[420px] lg:ml-8 xl:ml-16">
                  {children}
                </div>
              </div>
              {/* Login: Showcase on Right */}
              <div className="hidden lg:block lg:col-span-7">{ArchiveShowcase}</div>
            </>
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative w-full z-40 px-6 sm:px-12 lg:px-20 py-5 sm:py-6 flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase">
        {/* Left Branding */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[8px] font-bold">
            N
          </div>
          <span className="text-[#ff5500] font-bold">©</span>
          <span className={isLight ? "text-black" : "text-white"}>
            2026 [THEJERSEYHUB]
          </span>
        </div>

        {/* Right Legal */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`hover:opacity-100 transition-opacity ${
              isLight ? "text-[#666]" : "text-[#777]"
            }`}
          >
            [PRIVACY]
          </Link>
          <Link
            href="/"
            className={`hover:opacity-100 transition-opacity ${
              isLight ? "text-[#666]" : "text-[#777]"
            }`}
          >
            [TERMS]
          </Link>
          <span
            className={`hidden sm:inline-block ${
              isLight ? "text-[#666]" : "text-[#777]"
            }`}
          >
            [ENCRYPTED ARCHIVE ACCESS]
          </span>
        </div>
      </footer>
    </div>
  );
}

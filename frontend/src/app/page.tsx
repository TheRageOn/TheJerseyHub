"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { JERSEYS } from "@/data/jerseys";

/* ─── Constants ───────────────────────────────────────────────────── */
const N = JERSEYS.length;
const ANGLE_STEP = (2 * Math.PI) / N;
const LERP_PARALLAX = 0.08;
const LERP_CAROUSEL = 0.1;

/** Carousel math: returns visual props for jersey `i` at given `rotation`. */
function carouselProps(i: number, rot: number) {
  const a = (i - rot) * ANGLE_STEP;
  const x = Math.sin(a);
  const depth = (Math.cos(a) + 1) * 0.5; // 0=back, 1=front
  return {
    x,
    depth,
    scale: 0.35 + depth * 0.65,
    opacity: depth < 0.08 ? 0 : 0.15 + depth * 0.85,
    zIndex: Math.round(depth * 20),
  };
}

function radius(w: number) {
  if (w < 500) return 120;
  if (w < 768) return 200;
  if (w < 1024) return 280;
  return 380;
}

/* ─── Component ───────────────────────────────────────────────────── */
export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<"light" | "black">("black");
  const [timeString, setTimeString] = useState("00:00:00");

  // Animation values — refs only, zero re-renders at 60fps
  const targetRot = useRef(0);
  const curRot = useRef(0);
  const lastIdx = useRef(0);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const hovered = useRef<number | null>(null);

  // DOM refs for direct manipulation
  const jerseyEls = useRef<(HTMLDivElement | null)[]>([]);
  const sheenEls = useRef<(HTMLDivElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Swipe state
  const swipe = useRef({
    sx: 0,
    sy: 0,
    lx: 0,
    sRot: 0,
    sTime: 0,
    active: false,
  });
  const wheelSnap = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Audio ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const a = new Audio("/sound.mp3");
    a.loop = true;
    a.volume = 0.45;
    audioRef.current = a;
    const p = a.play();
    if (p) {
      p.catch(() => {
        const u = () => {
          audioRef.current?.play().catch(() => {});
          window.removeEventListener("click", u);
          window.removeEventListener("touchstart", u);
          window.removeEventListener("keydown", u);
        };
        window.addEventListener("click", u, { once: true });
        window.addEventListener("touchstart", u, { once: true });
        window.addEventListener("keydown", u, { once: true });
      });
    }
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleSound = useCallback(() => {
    if (!audioRef.current) return;
    if (soundOn) {
      audioRef.current.pause();
      setSoundOn(false);
    } else {
      audioRef.current.play().catch(() => {});
      setSoundOn(true);
    }
  }, [soundOn]);

  const toggleTheme = useCallback(
    () => setTheme((p) => (p === "light" ? "black" : "light")),
    [],
  );

  /* ─── Clock (1 re-render / sec) ─────────────────────────────────── */
  useEffect(() => {
    const t = () => setTimeString(new Date().toTimeString().split(" ")[0]);
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, []);

  /* ─── Core animation loop — ZERO re-renders ────────────────────── */
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    let raf: number;
    const tick = () => {
      const m = mouse.current;
      m.x += (m.tx - m.x) * LERP_PARALLAX;
      m.y += (m.ty - m.y) * LERP_PARALLAX;
      curRot.current += (targetRot.current - curRot.current) * LERP_CAROUSEL;

      const rot = curRot.current;
      const rY = m.x * 22,
        rX = m.y * -16,
        rZ = m.x * 2.5;
      const shX = m.x * -35,
        shY = 35 + m.y * -20;
      const snX = 50 + m.x * 35,
        snY = 50 + m.y * 35;
      const r = radius(window.innerWidth);

      for (let i = 0; i < N; i++) {
        const el = jerseyEls.current[i];
        const sh = sheenEls.current[i];
        if (!el) continue;

        const cp = carouselProps(i, rot);
        const front = cp.depth > 0.85;
        const hov = hovered.current === i && front;
        const sc = cp.scale * (hov ? 1.04 : 1);

        el.style.transform = `translate(-50%,-50%) translateX(${cp.x * r}px) scale(${sc})${
          front ? ` rotateY(${rY}deg) rotateX(${rX}deg) rotateZ(${rZ}deg)` : ""
        }`;
        el.style.opacity = String(cp.opacity);
        el.style.zIndex = String(cp.zIndex);
        el.style.filter = front
          ? `drop-shadow(${shX}px ${shY}px 45px rgba(0,0,0,.75)) brightness(1.05) contrast(1.05)`
          : `brightness(${0.25 + cp.depth * 0.55}) contrast(1.15) grayscale(${(1 - cp.depth) * 0.5})`;

        if (sh) {
          if (front) {
            sh.style.opacity = "0.4";
            sh.style.background = `radial-gradient(circle at ${snX}% ${snY}%,rgba(255,255,255,.7) 0%,rgba(255,255,255,.1) 35%,transparent 60%)`;
          } else {
            sh.style.opacity = "0";
          }
        }
      }

      // Only trigger React when the active jersey actually changes
      const idx = ((Math.round(targetRot.current) % N) + N) % N;
      if (idx !== lastIdx.current) {
        lastIdx.current = idx;
        setCurrentIndex(idx);
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

  /* ─── Touch swipe ───────────────────────────────────────────────── */
  const onTS = (e: React.TouchEvent) => {
    const t = e.touches[0];
    swipe.current = {
      sx: t.clientX,
      sy: t.clientY,
      lx: t.clientX,
      sRot: targetRot.current,
      sTime: Date.now(),
      active: false,
    };
  };
  const onTM = (e: React.TouchEvent) => {
    const s = swipe.current;
    const dx = e.touches[0].clientX - s.sx;
    const dy = e.touches[0].clientY - s.sy;
    if (!s.active && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10)
      s.active = true;
    if (s.active) {
      s.lx = e.touches[0].clientX;
      targetRot.current = s.sRot - dx / 220;
    }
  };
  const onTE = () => {
    const s = swipe.current;
    if (!s.active) return;
    s.active = false;
    const elapsed = Math.max(Date.now() - s.sTime, 1);
    const v = (s.lx - s.sx) / elapsed;
    if (Math.abs(v) > 0.3) targetRot.current += -v * 0.35;
    targetRot.current = Math.round(targetRot.current);
  };

  /* ─── Trackpad / wheel ──────────────────────────────────────────── */
  useEffect(() => {
    const onW = (e: WheelEvent) => {
      const d =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      targetRot.current += d * 0.002;
      if (wheelSnap.current) clearTimeout(wheelSnap.current);
      wheelSnap.current = setTimeout(
        () => (targetRot.current = Math.round(targetRot.current)),
        180,
      );
    };
    window.addEventListener("wheel", onW, { passive: true });
    return () => window.removeEventListener("wheel", onW);
  }, []);

  /* ─── Bring any jersey to front via shortest path ───────────────── */
  const bringToFront = useCallback((idx: number) => {
    const front = Math.round(targetRot.current);
    const fi = ((front % N) + N) % N;
    let d = idx - fi;
    if (d > N / 2) d -= N;
    if (d < -N / 2) d += N;
    targetRot.current = front + d;
  }, []);

  const isLight = theme === "light";
  const sel = JERSEYS[currentIndex];

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-700 ${
        isLight ? "theme-light text-[#1a1a1a]" : "theme-black text-[#d0d0d0]"
      }`}
      onTouchStart={onTS}
      onTouchMove={onTM}
      onTouchEnd={onTE}
    >
      {/* Film Grain — GPU-composited fixed layer */}
      <div
        className="film-grain"
        style={{ opacity: isLight ? 0.18 : 0.3 }}
      />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-10 py-5 sm:py-7 flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-[0.14em] sm:tracking-[0.18em] uppercase">
        <div className="flex items-center gap-3 sm:gap-8">
          <span
            className={`font-semibold tracking-[0.18em] sm:tracking-[0.22em] cursor-pointer ${
              isLight ? "text-black" : "text-white"
            }`}
          >
            [THEJERSEYHUB]
          </span>
          <button
            onClick={toggleSound}
            className={`hover:opacity-100 transition-opacity cursor-pointer ${
              isLight ? "text-[#555]" : "text-[#777]"
            }`}
          >
            SOUND
          </button>
        </div>

        {/* Center Emblem */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-6">
          <div
            className={`w-8 sm:w-10 h-5 sm:h-7 rounded-[2px] flex items-center justify-center px-1 cursor-pointer hover:scale-105 transition-transform ${
              isLight
                ? "bg-black text-white shadow-[0_0_15px_rgba(0,0,0,0.15)]"
                : "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            }`}
          >
            <svg
              className={`w-4 sm:w-5 h-4 sm:h-5 ${
                isLight ? "text-white" : "text-black"
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
            </svg>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-3 sm:gap-8">
          <button
            onClick={toggleTheme}
            className={`hover:opacity-100 transition-opacity cursor-pointer ${
              isLight ? "text-[#555]" : "text-[#777]"
            }`}
          >
            THEME
          </button>
          <Link
            href="/login"
            className={`font-semibold hover:opacity-80 transition-opacity cursor-pointer hidden sm:inline-block ${
              isLight ? "text-black" : "text-white"
            }`}
          >
            DISCOVER
          </Link>
        </div>
      </header>

      {/* ── Manifesto ──────────────────────────────────────────────── */}
      <div
        className={`absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 text-center text-[7.5px] sm:text-[10px] font-mono tracking-[0.12em] sm:tracking-[0.16em] uppercase leading-relaxed w-[90%] max-w-lg z-30 pointer-events-none ${
          isLight ? "text-[#555]" : "text-[#666]"
        }`}
      >
        <p>• THEJERSEYHUB / IMMERSIVE FOOTBALL ARCHIVE / 2026</p>
        <p>EXPERIENCE THE FUTURE BEFORE IT ARRIVES</p>
        <p className="hidden sm:block">
          MATCH SPEC • SHADERS • PERFORMANCE WEAVE • CREATOR RUN
        </p>
        <p>BUY • ARCHIVE • DISCOVER</p>
      </div>

      {/* ── Coordinate marks ───────────────────────────────────────── */}
      <div
        className={`absolute top-[16%] left-[8%] sm:left-[14%] font-mono text-[10px] sm:text-xs tracking-widest pointer-events-none ${
          isLight ? "text-black/25" : "text-white/20"
        }`}
      >
        [X]
      </div>
      <div
        className={`absolute top-[14%] right-[8%] sm:right-[16%] font-mono text-[10px] sm:text-xs tracking-widest pointer-events-none ${
          isLight ? "text-black/25" : "text-white/20"
        }`}
      >
        [X]
      </div>
      <div
        className={`absolute bottom-[20%] left-[10%] sm:left-[21%] font-mono text-[10px] sm:text-xs tracking-widest pointer-events-none ${
          isLight ? "text-black/25" : "text-white/20"
        }`}
      >
        [X]
      </div>
      <div
        className={`absolute bottom-[16%] right-[8%] sm:right-[10%] font-mono text-[10px] sm:text-xs tracking-widest pointer-events-none ${
          isLight ? "text-black/25" : "text-white/20"
        }`}
      >
        [X]
      </div>

      {/* ── Left HUD (desktop) ─────────────────────────────────────── */}
      <div
        className={`absolute left-8 sm:left-12 top-[42%] -translate-y-1/2 text-[10px] font-mono tracking-[0.14em] leading-5 z-30 pointer-events-none hidden lg:block ${
          isLight ? "text-[#555]" : "text-[#666]"
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
        <p className={`mt-2 ${isLight ? "text-black/80" : "text-white/90"}`}>
          SESSION : [19.08.2026]
        </p>
        <p>TIMESTAMP : [{timeString}]</p>
        <p
          className={`mt-2 font-semibold ${
            isLight ? "text-black" : "text-white"
          }`}
        >
          EDITION : [{sel.code}]
        </p>
        <p
          className={`font-semibold ${
            isLight ? "text-black" : "text-white"
          }`}
        >
          VALUATION : [{sel.price}]
        </p>
      </div>

      {/* ── Right HUD (desktop) ────────────────────────────────────── */}
      <div
        className={`absolute right-8 sm:right-12 bottom-[20%] text-[10px] font-mono tracking-[0.14em] leading-5 z-30 pointer-events-none text-right hidden lg:block ${
          isLight ? "text-[#555]" : "text-[#666]"
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
        <p className={`mt-2 ${isLight ? "text-black/80" : "text-white/90"}`}>
          CLUB : [{sel.club}]
        </p>
        <p className="truncate max-w-[200px]">SPEC : [{sel.name}]</p>
        <p className="mt-2 text-[#ff5500]">STATUS : [ARCHIVED / VERIFIED]</p>
      </div>

      {/* ── 3D Circular Carousel — DOM-driven, no React state ──────── */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {JERSEYS.map((jersey, idx) => (
          <div
            key={jersey.id}
            ref={(el) => {
              jerseyEls.current[idx] = el;
            }}
            className="absolute left-1/2 top-1/2 pointer-events-auto cursor-pointer w-[220px] sm:w-[300px] md:w-[420px] lg:w-[540px] h-[290px] sm:h-[390px] md:h-[540px] lg:h-[680px]"
            style={{
              willChange: "transform, opacity, filter",
              contain: "style",
            }}
            onClick={() => {
              const cp = carouselProps(idx, curRot.current);
              if (cp.depth > 0.85) {
                targetRot.current = Math.round(targetRot.current) + 1;
              } else {
                bringToFront(idx);
              }
            }}
            onMouseEnter={() => {
              hovered.current = idx;
            }}
            onMouseLeave={() => {
              hovered.current = null;
            }}
          >
            {/* Specular sheen overlay */}
            <div
              ref={(el) => {
                sheenEls.current[idx] = el;
              }}
              className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay rounded-full"
              style={{ opacity: 0 }}
            />
            <Image
              src={jersey.imageSrc}
              alt={jersey.name}
              fill
              priority
              sizes="(max-width:640px) 220px,(max-width:768px) 300px,(max-width:1024px) 420px,540px"
              className="object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer
        className={`fixed bottom-0 left-0 w-full z-40 px-4 sm:px-10 py-5 sm:py-6 flex items-center justify-between text-[9.5px] sm:text-[10px] font-mono tracking-[0.14em] sm:tracking-[0.18em] uppercase pointer-events-none ${
          isLight ? "text-[#666]" : "text-[#666]"
        }`}
      >
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span className="text-[#ff5500] font-bold">©</span>
          <span className={isLight ? "text-black" : "text-white"}>
            2026 [THEJERSEYHUB]
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {JERSEYS.map((j, i) => (
            <button
              key={j.id}
              onClick={() => bringToFront(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentIndex
                  ? isLight
                    ? "w-5 sm:w-8 bg-black"
                    : "w-5 sm:w-8 bg-white"
                  : isLight
                  ? "w-1.5 sm:w-2 bg-black/20 hover:bg-black/50"
                  : "w-1.5 sm:w-2 bg-white/20 hover:bg-white/50"
              }`}
              aria-label={`Select ${j.name}`}
            />
          ))}
        </div>
        <div className="pointer-events-auto">
          <span
            className={`hover:opacity-100 transition-opacity cursor-pointer ${
              isLight ? "text-black" : "text-white"
            }`}
          >
            CONTACT
          </span>
        </div>
      </footer>
    </main>
  );
}

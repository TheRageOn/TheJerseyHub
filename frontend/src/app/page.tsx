"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { JERSEYS } from "@/data/jerseys";
import Navbar from "@/components/landing/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import ContactModal from "@/components/contact/ContactModal";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";

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
  /*
   * States:
   *   currentIndex      → changes when user switches jerseys
   *   timeString        → once per second
   *   authModalOpen     → for signup / login modal popup
   *   authMode          → 'login' | 'signup'
   *   contactModalOpen  → for contact email modal
   */
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme, isWhite } = useTheme();
  const { addToCart } = useCart();
  const [timeString, setTimeString] = useState("00:00:00");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [showSpecsHUD, setShowSpecsHUD] = useState(true);
  const [showIntelHUD, setShowIntelHUD] = useState(true);

  // Animation values — refs only, zero re-renders at 60fps
  const targetRot = useRef(0);
  const curRot = useRef(0);
  const lastIdx = useRef(0);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const hovered = useRef<number | null>(null);

  // DOM refs for direct manipulation
  const jerseyEls = useRef<(HTMLDivElement | null)[]>([]);
  const sheenEls = useRef<(HTMLDivElement | null)[]>([]);

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

  const handleOpenAuth = useCallback((mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  }, []);

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
          ? `drop-shadow(${shX}px ${shY}px 45px rgba(0,0,0,.65)) brightness(1.03) contrast(1.05)`
          : `brightness(${0.25 + cp.depth * 0.55}) contrast(1.15) grayscale(${(1 - cp.depth) * 0.5})`;

        if (sh) {
          if (front) {
            sh.style.opacity = "0.35";
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

  const sel = JERSEYS[currentIndex];

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-700 ${
        isWhite ? "theme-white" : "theme-black"
      }`}
      onTouchStart={onTS}
      onTouchMove={onTM}
      onTouchEnd={onTE}
    >
      {/* Tactile High-Pass Film Grain Overlay */}
      <div
        className="film-grain"
        style={{ opacity: isWhite ? 0.28 : 0.18 }}
      />

      {/* ── Top Marquee Header Bar ─────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 h-8 backdrop-blur-md border-b flex items-center justify-between px-6 sm:px-10 text-[8.5px] sm:text-[9.5px] font-mono tracking-[0.16em] sm:tracking-[0.2em] uppercase select-none pointer-events-auto transition-colors ${
          isWhite
            ? "bg-[#faf7f0]/95 border-black/10 text-[#0c0c0c]"
            : "bg-[#070707]/95 border-white/10 text-white"
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse shrink-0" />
          <span className={isWhite ? "text-black/85" : "text-white/80"}>
            THEJERSEYHUB / IMMERSIVE FOOTBALL ARCHIVE / 2026
          </span>
          <span className={isWhite ? "text-black/25 hidden sm:inline" : "text-white/20 hidden sm:inline"}>
            •
          </span>
          <span className={isWhite ? "text-black/50 hidden sm:inline" : "text-white/50 hidden sm:inline"}>
            EXPERIENCE THE FUTURE BEFORE IT ARRIVES
          </span>
        </div>
        <div className={`hidden md:flex items-center gap-4 ${isWhite ? "text-black/40" : "text-white/40"}`}>
          <span>MATCH SPEC</span>
          <span>•</span>
          <span>SHADERS</span>
          <span>•</span>
          <span>VAULT LIVE</span>
        </div>
      </div>

      {/* ── Thick Editorial Navbar ─────────────────────────────────── */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onDiscoverNext={() =>
          (targetRot.current = Math.round(targetRot.current) + 1)
        }
      />

      {/* ── Left HUD: KIT SPECS ───────────────────────────────────── */}
      {showSpecsHUD && (
        <div
          className={`fixed left-6 sm:left-10 top-[40%] -translate-y-1/2 w-64 sm:w-72 backdrop-blur-xl rounded-2xl p-6 sm:p-7 z-30 pointer-events-auto hidden lg:block transition-all ${
            isWhite
              ? "bg-[#faf7f0]/90 border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.07)] text-[#0c0c0c]"
              : "bg-[#0a0a0a]/90 border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-[#888]"
          }`}
        >
          {/* Top-Right Anchored Close Button */}
          <button
            onClick={() => setShowSpecsHUD(false)}
            className={`absolute top-4 right-4 sm:top-5 sm:right-5 w-6 h-6 flex items-center justify-center rounded-lg font-mono text-[9.5px] transition-colors cursor-pointer border ${
              isWhite
                ? "text-black/40 hover:text-black hover:bg-black/5 border-black/10"
                : "text-white/40 hover:text-white hover:bg-white/10 border-white/10"
            }`}
            title="Dismiss panel"
            aria-label="Close Kit Specs"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]" />
            <p className={`tracking-[0.2em] font-mono font-bold text-[11px] ${isWhite ? "text-black" : "text-white"}`}>
              KIT SPECS
            </p>
          </div>
          <div className={`w-full h-[1px] mb-4 ${isWhite ? "bg-black/10" : "bg-white/10"}`} />

          <div className={`space-y-2.5 text-[10px] font-mono tracking-[0.14em] ${isWhite ? "text-black/75" : "text-white/80"}`}>
            <p>SESSION : [19.08.2026]</p>
            <p>TIMESTAMP : [{timeString}]</p>
            <p className={`font-semibold pt-1 ${isWhite ? "text-black" : "text-white"}`}>
              EDITION : [{sel.code}]
            </p>
            <p className={`font-semibold ${isWhite ? "text-black" : "text-white"}`}>
              VALUATION : [{sel.price}]
            </p>
          </div>
        </div>
      )}

      {/* ── Right HUD: VAULT INTEL ──────────────────────────────────── */}
      {showIntelHUD && (
        <div
          className={`fixed right-6 sm:right-10 bottom-[14%] w-72 sm:w-80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 z-30 pointer-events-auto hidden lg:block transition-all ${
            isWhite
              ? "bg-[#faf7f0]/90 border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.07)] text-[#0c0c0c]"
              : "bg-[#0a0a0a]/90 border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-[#888]"
          }`}
        >
          {/* Top-Right Anchored Close Button */}
          <button
            onClick={() => setShowIntelHUD(false)}
            className={`absolute top-4 right-4 sm:top-5 sm:right-5 w-6 h-6 flex items-center justify-center rounded-lg font-mono text-[9.5px] transition-colors cursor-pointer border ${
              isWhite
                ? "text-black/40 hover:text-black hover:bg-black/5 border-black/10"
                : "text-white/40 hover:text-white hover:bg-white/10 border-white/10"
            }`}
            title="Dismiss panel"
            aria-label="Close Vault Intel"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]" />
            <p className={`tracking-[0.2em] font-mono font-bold text-[11px] ${isWhite ? "text-black" : "text-white"}`}>
              VAULT INTEL
            </p>
          </div>
          <div className={`w-full h-[1px] mb-4 ${isWhite ? "bg-black/10" : "bg-white/10"}`} />

          <div className={`space-y-2.5 text-[10px] font-mono tracking-[0.14em] ${isWhite ? "text-black/80" : "text-white/90"}`}>
            <p>CLUB : [{sel.club}]</p>
            <p
              className={`leading-relaxed break-words pt-0.5 ${isWhite ? "text-black/70" : "text-white/80"}`}
              title={sel.name}
            >
              SPEC : [{sel.name}]
            </p>
            <p className="text-[#ff5500] font-semibold pt-1">
              STATUS : [ARCHIVED / VERIFIED]
            </p>
          </div>

          {/* Quick Add to Bag Action Button */}
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              onClick={() => addToCart(sel, "L")}
              className="w-full py-2.5 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white font-mono text-[10px] font-bold tracking-wider rounded-xl transition-all shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>ADD TO BAG</span>
              <span>•</span>
              <span>{sel.price}</span>
            </button>
          </div>
        </div>
      )}

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
          isWhite ? "text-black/60" : "text-[#888]"
        }`}
      >
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span className="text-[#ff5500] font-bold">©</span>
          <span className={isWhite ? "text-black font-semibold" : "text-white"}>
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
                  ? isWhite
                    ? "w-5 sm:w-8 bg-black"
                    : "w-5 sm:w-8 bg-white"
                  : isWhite
                  ? "w-1.5 sm:w-2 bg-black/20 hover:bg-black/50"
                  : "w-1.5 sm:w-2 bg-white/20 hover:bg-white/50"
              }`}
              aria-label={`Select ${j.name}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          {(!showSpecsHUD || !showIntelHUD) && (
            <button
              onClick={() => {
                setShowSpecsHUD(true);
                setShowIntelHUD(true);
              }}
              className="hover:opacity-80 transition-opacity cursor-pointer text-[#ff5500] font-semibold"
            >
              [RESTORE HUDS]
            </button>
          )}
          <button
            onClick={() => setContactModalOpen(true)}
            className={`transition-opacity hover:opacity-70 cursor-pointer font-mono ${
              isWhite ? "text-black" : "text-white"
            }`}
          >
            CONTACT
          </button>
        </div>
      </footer>

      {/* ── Authentication Modal (Theme-responsive with gradient look) ── */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        theme={theme}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* ── Contact Desk Modal (Sends to nantio.official@gmail.com) ─── */}
      <ContactModal
        isOpen={contactModalOpen}
        theme={theme}
        onClose={() => setContactModalOpen(false)}
      />
    </main>
  );
}

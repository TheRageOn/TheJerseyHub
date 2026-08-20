"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { JERSEYS } from "@/data/jerseys";
import { useAuth } from "@/context/AuthContext";

/* ══════════════════════════════════════════════════════════════════════
   1. SHARED CARD PRIMITIVES WITH ENFORCED SAFE-AREA INSETS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Standard Card Action Button ([INSPECT], [+ RESERVE SLOT], etc.)
 * Always has generous internal padding and shrink-0 so text/brackets never clip.
 */
interface CardActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

function CardAction({ children, onClick, variant = "primary", className = "" }: CardActionProps) {
  const base =
    "inline-flex items-center justify-center font-mono font-bold uppercase tracking-[0.16em] text-[9.5px] sm:text-[10px] px-4.5 py-2 rounded-full shrink-0 whitespace-nowrap transition-all cursor-pointer select-none active:scale-[0.98]";

  const variants = {
    primary: "bg-black text-white dark:bg-white dark:text-black shadow-sm hover:opacity-85",
    secondary: "bg-[#ff5500] text-white shadow-sm hover:opacity-90",
    outline: "border border-current/25 hover:border-current/70 bg-transparent opacity-85 hover:opacity-100",
  };

  return (
    <button type="button" onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

/**
 * Base ArchiveCard Primitive
 * Enforces p-7 sm:p-8 (28px - 32px) internal padding.
 * Since padding (28px+) exceeds corner radius (24px), children are GUARANTEED
 * to sit inside the flat straight boundary segments, never on the curve.
 */
interface ArchiveCardProps {
  children: React.ReactNode;
  elevation?: "hero" | "primary" | "secondary" | "subtle";
  isLight?: boolean;
  className?: string;
  onClick?: () => void;
}

function ArchiveCard({
  children,
  elevation = "primary",
  isLight = false,
  className = "",
  onClick,
}: ArchiveCardProps) {
  const elevationStyles = {
    hero: isLight
      ? "bg-white border-black/20 shadow-[0_12px_40px_rgba(0,0,0,0.09)]"
      : "bg-[#191919] border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.65)]",
    primary: isLight
      ? "bg-white border-black/15 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
      : "bg-[#161616] border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
    secondary: isLight
      ? "bg-white/60 border-black/10"
      : "bg-[#121212]/80 border-white/10",
    subtle: isLight
      ? "bg-black/[0.025] border-black/10 hover:border-black/25"
      : "bg-white/[0.025] border-white/10 hover:border-white/25",
  };

  return (
    <div
      onClick={onClick}
      className={`min-w-0 rounded-[26px] border p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all ${elevationStyles[elevation]} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Standardized Card Header Row with internal horizontal clearance
 */
function CardHeader({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="w-full flex items-center justify-between gap-4 pb-3.5 border-b border-dashed border-current/15 px-1 shrink-0">
      <div className="min-w-0 flex-1">{left}</div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/**
 * Standardized Card Footer Row with internal horizontal clearance
 */
function CardFooter({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="w-full flex items-center justify-between gap-4 pt-3.5 border-t border-dashed border-current/15 px-1 shrink-0">
      <div className="min-w-0 flex-1">{left}</div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

/**
 * Smooth Pill Toggle Switch Primitive
 */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer border shrink-0 ${
        on
          ? "bg-black text-white dark:bg-white dark:text-black border-current"
          : "bg-black/10 dark:bg-white/10 border-current/20"
      }`}
    >
      <div
        className={`w-4.5 h-4.5 rounded-full transition-transform ${
          on ? "translate-x-5 bg-white dark:bg-black shadow-sm" : "translate-x-0 bg-current/40"
        }`}
      />
    </button>
  );
}

/**
 * Self-Contained Toggle Tile with 24px Safe-Area Inset
 */
interface ToggleTileProps {
  label: string;
  sub: string;
  val: boolean;
  onToggle: () => void;
  isLight: boolean;
}

function ToggleTile({ label, sub, val, onToggle, isLight }: ToggleTileProps) {
  return (
    <div
      className={`rounded-[22px] border p-5 sm:p-6 flex flex-col justify-between gap-3 min-h-[140px] transition-all ${
        isLight
          ? "bg-black/[0.03] border-black/10 hover:border-black/20"
          : "bg-white/[0.03] border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between px-0.5">
        <span
          className={`text-[9px] font-mono font-bold tracking-[0.18em] uppercase ${
            val ? "text-[#ff5500]" : "opacity-40"
          }`}
        >
          {val ? "ON" : "OFF"}
        </span>
      </div>
      <div className="min-w-0 px-0.5">
        <p className="text-[11px] font-mono font-bold uppercase leading-tight truncate">{label}</p>
        <p className="text-[8.5px] font-mono opacity-45 uppercase truncate mt-0.5">{sub}</p>
      </div>
      <div className="px-0.5">
        <Toggle on={val} onToggle={onToggle} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. SVG SIDEBAR ICONS
   ══════════════════════════════════════════════════════════════════════ */
const IconVault = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7L12 2z" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <circle cx="12" cy="9" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const IconBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const IconHeart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const IconGear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

/* ══════════════════════════════════════════════════════════════════════
   3. SAMPLE DATA
   ══════════════════════════════════════════════════════════════════════ */
const ORDERS = [
  { id: "#TJH-9842", kit: "ARS CANNON HOME 22/23", date: "18 AUG 2026", status: "IN TRANSIT", price: "$92.00" },
  { id: "#TJH-9801", kit: "FCB 125TH ANNIVERSARY", date: "10 AUG 2026", status: "DELIVERED", price: "$125.00" },
  { id: "#TJH-9755", kit: "RMA HOME 23/24", date: "28 JUL 2026", status: "DELIVERED", price: "$110.00" },
];

const INVENTORY = [
  { ...JERSEYS[0], owned: true },
  { ...JERSEYS[1], owned: false },
  { ...JERSEYS[2], owned: true },
  { ...JERSEYS[3], owned: false },
];

/* ══════════════════════════════════════════════════════════════════════
   4. MAIN DASHBOARD PAGE
   ══════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "black">("black");
  const [activeJerseyIndex, setActiveJerseyIndex] = useState(0);
  const [activeNav, setActiveNav] = useState<"vault" | "orders" | "wishlist" | "drops" | "settings">("vault");
  const [activeCategory, setActiveCategory] = useState("ALL KITS");

  /* Account preference states */
  const [authAlertsOn, setAuthAlertsOn] = useState(true);
  const [restockOn, setRestockOn] = useState(true);
  const [autoReserveOn, setAutoReserveOn] = useState(false);
  const [codOn, setCodOn] = useState(true);

  const [dateString, setDateString] = useState("AUG 20, 2026");

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "black" : "light"));
  }, []);

  useEffect(() => {
    setDateString(
      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    );
  }, []);

  /* 3D Parallax for hero jersey */
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
        jerseyRef.current.style.transform = `rotateY(${m.x * 16}deg) rotateX(${m.y * -12}deg)`;
        jerseyRef.current.style.filter = `drop-shadow(${m.x * -18}px ${18 + m.y * -10}px 24px rgba(0,0,0,0.4)) brightness(1.04)`;
      }
      if (sheenRef.current) {
        const sx = 50 + m.x * 35, sy = 50 + m.y * 35;
        sheenRef.current.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.07) 35%, transparent 60%)`;
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
  const sel = JERSEYS[activeJerseyIndex];

  /* Tier progress arc */
  const tierPct = 88;
  const R = 70;
  const circ = 2 * Math.PI * R;
  const offset = circ - (tierPct / 100) * (circ * 0.75);

  const categories = ["ALL KITS", "CLUB", "NATION", "SPECIAL", "VINTAGE"];
  const navItems: { key: typeof activeNav; Icon: React.FC; label: string }[] = [
    { key: "vault", Icon: IconVault, label: "Vault" },
    { key: "orders", Icon: IconBag, label: "Orders" },
    { key: "wishlist", Icon: IconHeart, label: "Wishlist" },
    { key: "drops", Icon: IconBell, label: "Drop Alerts" },
    { key: "settings", Icon: IconGear, label: "Settings" },
  ];

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-8 lg:p-10 font-mono transition-colors duration-700 select-none ${
        isLight ? "theme-light text-[#111111] bg-[#e4ded4]" : "theme-black text-[#d0d0d0] bg-[#080808]"
      }`}
    >
      <div className="film-grain" />

      {/* ── Outer Device-Bezel Frame ─────────────────────────────────── */}
      <div
        className={`relative w-full max-w-[1440px] mx-auto rounded-[32px] sm:rounded-[40px] border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight
            ? "bg-[#f2eee7] border-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
            : "bg-[#111111] border-white/12 shadow-[0_25px_70px_rgba(0,0,0,0.7)]"
        }`}
      >
        {/* ── Top Header Navigation Bar (Guaranteed 40px+ Corner Inset) ── */}
        <header
          className={`w-full px-8 sm:px-12 lg:px-14 py-5 border-b flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 z-30 transition-colors ${
            isLight ? "border-black/10 bg-white/40" : "border-white/10 bg-black/40"
          }`}
        >
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className={`font-bold text-[12px] sm:text-[13px] tracking-[0.2em] uppercase transition-opacity hover:opacity-75 ${
                isLight ? "text-black" : "text-white"
              }`}
            >
              [THEJERSEYHUB]
            </Link>
          </div>

          {/* Center Category Pill Dock (Independent, Well-Spaced Pills) */}
          <div
            className={`p-1 px-2 rounded-full border flex items-center gap-1.5 sm:gap-2 shadow-sm shrink-0 ${
              isLight ? "bg-white/80 border-black/10" : "bg-black/80 border-white/10"
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-[9px] sm:text-[9.5px] tracking-[0.14em] uppercase transition-all cursor-pointer rounded-full font-semibold shrink-0 ${
                  activeCategory === cat
                    ? isLight
                      ? "bg-black text-white shadow-sm"
                      : "bg-white text-black shadow-sm"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-6 text-[10.5px] tracking-[0.16em] uppercase shrink-0">
            <button
              onClick={toggleTheme}
              className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer font-bold"
            >
              THEME
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-[#ff5500] font-bold hover:opacity-80 transition-opacity cursor-pointer"
            >
              [LOGOUT]
            </button>
          </div>
        </header>

        {/* ── Main Workspace Body: Sidebar + Bento Grid ───────────────── */}
        <div className="flex flex-col lg:flex-row flex-1 p-6 sm:p-8 lg:p-10 gap-6 sm:gap-8 min-w-0">
          {/* ── Left Sidebar Rail ─────────────────────────────────────── */}
          <aside
            className={`w-full lg:w-[72px] shrink-0 rounded-[24px] sm:rounded-[28px] flex flex-row lg:flex-col items-center justify-between p-4 lg:py-8 border transition-colors ${
              isLight ? "bg-white/50 border-black/10 shadow-sm" : "bg-black/50 border-white/10 shadow-md"
            }`}
          >
            {/* Emblem Mark */}
            <Link
              href="/"
              className={`w-11 h-11 lg:mx-auto rounded-[14px] flex items-center justify-center text-[11px] font-bold shadow-sm transition-transform hover:scale-105 shrink-0 ${
                isLight ? "bg-black text-white" : "bg-white text-black"
              }`}
              title="Home"
            >
              N
            </Link>

            {/* Navigation Icons Stack */}
            <nav className="flex flex-row lg:flex-col items-center gap-3 lg:gap-4 my-auto">
              {navItems.map(({ key, Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveNav(key)}
                  title={label}
                  className={`w-11 h-11 lg:mx-auto flex items-center justify-center transition-all cursor-pointer rounded-[14px] border shrink-0 ${
                    activeNav === key
                      ? isLight
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-black border-white shadow-sm"
                      : "border-transparent opacity-45 hover:opacity-100 hover:bg-current/[0.04]"
                  }`}
                >
                  <Icon />
                </button>
              ))}
            </nav>

            {/* Bottom Status Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5500] hidden lg:block lg:mx-auto shrink-0" title="Session Active" />
          </aside>

          {/* ── Bento Grid Canvas ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 sm:gap-8">
            {/* User Greeting & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="min-w-0">
                <div className="text-[10px] text-[#ff5500] tracking-[0.2em] uppercase font-semibold">
                  • COLLECTOR VAULT // {user ? "AUTHENTICATED" : "SESSION ACTIVE"}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-[0.06em] uppercase mt-1 truncate">
                  VAULT // {user?.name ? user.name.toUpperCase() : "RAJAK"} [PRO — TIER 03]
                </h1>
              </div>
              <div className="shrink-0 text-[10.5px] tracking-[0.16em] opacity-60 uppercase">
                {dateString}
              </div>
            </div>

            {/* ── Bento Main Row (3-Column Layout: 3 cols | 4 cols | 5 cols) ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* ── LEFT (3 cols): 2x2 Toggle Cluster & In-Transit Card ──── */}
              <div className="md:col-span-12 lg:col-span-3 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <ToggleTile
                    label="AUTH ALERTS"
                    sub="MATCH VERIFY"
                    val={authAlertsOn}
                    onToggle={() => setAuthAlertsOn(!authAlertsOn)}
                    isLight={isLight}
                  />
                  <ToggleTile
                    label="RESTOCK"
                    sub="WISHLIST"
                    val={restockOn}
                    onToggle={() => setRestockOn(!restockOn)}
                    isLight={isLight}
                  />
                  <ToggleTile
                    label="RESERVE"
                    sub="LIVE DROPS"
                    val={autoReserveOn}
                    onToggle={() => setAutoReserveOn(!autoReserveOn)}
                    isLight={isLight}
                  />
                  <ToggleTile
                    label="COD PAY"
                    sub="DELIVERY"
                    val={codOn}
                    onToggle={() => setCodOn(!codOn)}
                    isLight={isLight}
                  />
                </div>

                {/* Active In-Transit Order Card */}
                <div
                  className={`rounded-[22px] border p-6 flex items-center justify-between gap-4 transition-all ${
                    isLight ? "bg-black/[0.03] border-black/10" : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#ff5500] font-bold tracking-[0.16em] uppercase">• IN TRANSIT</p>
                    <p className="text-[12px] font-bold uppercase truncate mt-0.5">ORDER #TJH-9842</p>
                    <p className="text-[9px] opacity-40 uppercase truncate mt-0.5">1× ARS CANNON // 22 AUG</p>
                  </div>
                  <button className="text-[9.5px] tracking-[0.16em] font-bold uppercase underline opacity-70 hover:opacity-100 hover:text-[#ff5500] transition-colors cursor-pointer shrink-0">
                    [TRACK]
                  </button>
                </div>
              </div>

              {/* ── CENTER (4 cols): Tier Progress Arc & Next Drop ──────── */}
              <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                {/* Tier Progress Arc Card */}
                <ArchiveCard elevation="primary" isLight={isLight}>
                  <CardHeader
                    left={<span className="text-[10.5px] font-mono tracking-[0.18em] uppercase truncate block">[COLLECTOR TIER]</span>}
                    right={<span className="text-[#ff5500] text-[10.5px] font-mono font-bold tracking-[0.16em] whitespace-nowrap">• PRO LEVEL 03</span>}
                  />

                  {/* Arc Gauge */}
                  <div className="relative flex items-center justify-center my-3">
                    <svg className="w-36 h-36 sm:w-40 sm:h-40 -rotate-90" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r={R}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="opacity-10"
                        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r={R}
                        stroke="#ff5500"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold tracking-tight">{tierPct}%</span>
                      <span className="text-[9px] tracking-[0.16em] opacity-50 uppercase mt-0.5">TO TIER 04</span>
                    </div>
                  </div>

                  <p className="text-[9.5px] tracking-[0.14em] opacity-60 uppercase text-center">
                    180 PTS UNLOCKS 98/99 TREBLE RETRO DROP ACCESS
                  </p>
                </ArchiveCard>

                {/* Next Drop Card */}
                <ArchiveCard elevation="primary" isLight={isLight}>
                  <CardHeader
                    left={<span className="text-[10.5px] font-mono tracking-[0.18em] uppercase truncate block">[NEXT SCHEDULED DROP]</span>}
                    right={<span className="text-[#ff5500] text-[10.5px] font-mono font-bold tracking-[0.16em] whitespace-nowrap">• 26 AUG</span>}
                  />
                  <div className="py-2.5 min-w-0">
                    <p className="text-sm sm:text-base font-bold uppercase tracking-[0.06em] truncate">MAN UTD 98/99 TREBLE</p>
                    <p className="text-[10px] opacity-60 uppercase mt-0.5 truncate">ALLOCATION : 25 UNITS // UMBRO SHARP</p>
                  </div>
                  <CardFooter
                    left={<span className="text-[9px] text-[#ff5500] font-mono font-bold whitespace-nowrap">• DROP ALERT [ACTIVE]</span>}
                    right={<CardAction variant="outline">[+ RESERVE SLOT]</CardAction>}
                  />
                </ArchiveCard>
              </div>

              {/* ── RIGHT (5 cols): 3D Hero Jersey Card (Shared Primitive) ── */}
              <ArchiveCard elevation="hero" isLight={isLight} className="md:col-span-12 lg:col-span-5">
                {/* Header Row: Spec Tag + Price (Guaranteed safe padding, zero border touch) */}
                <CardHeader
                  left={
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#ff5500] font-bold tracking-[0.16em] uppercase block">• FEATURED SPEC</span>
                      <p className="text-[12px] font-bold uppercase mt-0.5 truncate">{sel.club}</p>
                    </div>
                  }
                  right={<span className="text-[13px] font-bold tracking-[0.08em] whitespace-nowrap">{sel.price}</span>}
                />

                {/* 3D Jersey Display Stage */}
                <div
                  ref={jerseyRef}
                  className="relative w-full h-[180px] sm:h-[200px] my-3 flex items-center justify-center will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div ref={sheenRef} className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay rounded-full opacity-40" />
                  <div className="relative w-[150px] h-[180px] sm:w-[175px] sm:h-[200px]">
                    <Image
                      src={sel.imageSrc}
                      alt={sel.name}
                      fill
                      priority
                      sizes="(max-width:1024px) 175px, 200px"
                      className="object-contain"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Info Block */}
                <div className="flex items-baseline justify-between gap-3 pb-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold uppercase truncate">{sel.name}</p>
                    <p className="text-[9.5px] opacity-50 uppercase truncate mt-0.5">{sel.season} // [{sel.code}]</p>
                  </div>
                  <span className="shrink-0 text-[9px] text-[#ff5500] font-bold whitespace-nowrap">[VERIFIED]</span>
                </div>

                {/* Footer Section: Clean Separation Below Image, Kit Selector Tabs + INSPECT Button */}
                <CardFooter
                  left={
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
                      {JERSEYS.map((j, idx) => (
                        <button
                          key={j.id}
                          onClick={() => setActiveJerseyIndex(idx)}
                          className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-[9px] font-mono rounded-full border font-bold transition-all cursor-pointer ${
                            activeJerseyIndex === idx
                              ? "bg-black text-white dark:bg-white dark:text-black border-current shadow-sm"
                              : "border-current/20 opacity-50 hover:opacity-100"
                          }`}
                        >
                          {j.code.split("/")[0]}
                        </button>
                      ))}
                    </div>
                  }
                  right={<CardAction variant="primary">[INSPECT]</CardAction>}
                />
              </ArchiveCard>
            </div>

            {/* ── Row 3: Full Vault Grid (Contained Inside Shared Card) ─ */}
            <ArchiveCard elevation="secondary" isLight={isLight}>
              <CardHeader
                left={<span className="text-[11px] font-bold tracking-[0.18em] uppercase truncate block">[VAULT COLLECTION // ALL KITS]</span>}
                right={<span className="text-[10px] tracking-[0.16em] opacity-50 uppercase whitespace-nowrap">{INVENTORY.length} ENTRIES</span>}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-4">
                {INVENTORY.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveJerseyIndex(idx)}
                    className={`min-w-0 p-5 sm:p-6 rounded-[22px] border flex flex-col justify-between gap-3 min-h-[230px] cursor-pointer transition-all hover:scale-[1.02] ${
                      activeJerseyIndex === idx
                        ? isLight
                          ? "border-black bg-white shadow-md"
                          : "border-white bg-[#1a1a1a] shadow-lg"
                        : isLight
                        ? "bg-white/60 border-black/10 hover:border-black/30"
                        : "bg-black/40 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="relative w-full h-24 sm:h-28 my-1">
                      <Image src={item.imageSrc} alt={item.name} fill className="object-contain" />
                    </div>
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <p className="text-[11px] font-bold uppercase truncate">{item.club}</p>
                      <p className="text-[9px] opacity-40 uppercase truncate">{item.season} // [{item.code}]</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-current/10">
                      <span className="shrink-0 text-[9.5px] font-bold whitespace-nowrap">{item.price}</span>
                      <span
                        className={`text-[8.5px] px-2.5 py-0.5 rounded-full border font-bold uppercase shrink-0 whitespace-nowrap ${
                          item.owned
                            ? "text-[#ff5500] border-[#ff5500]/40 bg-[#ff5500]/10"
                            : "border-current/20 opacity-60"
                        }`}
                      >
                        {item.owned ? "[OWNED]" : "[WISH]"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ArchiveCard>

            {/* ── Row 4: Order History (Fixed 12-Column Grid Alignment) ─── */}
            <ArchiveCard elevation="secondary" isLight={isLight}>
              <CardHeader
                left={<span className="text-[11px] font-bold tracking-[0.18em] uppercase">[ORDER HISTORY // ARCHIVE]</span>}
                right={
                  <Link href="/login" className="text-[9.5px] tracking-[0.16em] opacity-60 hover:opacity-100 uppercase underline transition-opacity">
                    [VIEW ALL]
                  </Link>
                }
              />

              {/* Table Header */}
              <div className="grid grid-cols-12 items-center gap-4 px-3 pt-3 text-[9px] tracking-[0.16em] opacity-40 uppercase font-bold">
                <span className="col-span-3 sm:col-span-2">ORDER REF</span>
                <span className="col-span-5 sm:col-span-5">KIT SPECIFICATION</span>
                <span className="hidden sm:block sm:col-span-2">TIMESTAMP</span>
                <span className="col-span-2 sm:col-span-1 text-right sm:text-left">PRICE</span>
                <span className="col-span-2 sm:col-span-2 text-right">STATUS</span>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col divide-y divide-dashed divide-current/15 pt-1">
                {ORDERS.map((order) => (
                  <div key={order.id} className="grid grid-cols-12 items-center gap-4 py-3.5 px-3 text-[10.5px] hover:bg-current/[0.02] rounded-[12px] transition-colors">
                    <span className="col-span-3 sm:col-span-2 opacity-50 shrink-0 truncate">{order.id}</span>
                    <span className="col-span-5 sm:col-span-5 font-bold uppercase truncate">{order.kit}</span>
                    <span className="hidden sm:block sm:col-span-2 opacity-50 truncate">{order.date}</span>
                    <span className="col-span-2 sm:col-span-1 font-bold text-right sm:text-left truncate">{order.price}</span>
                    <div className="col-span-2 sm:col-span-2 text-right">
                      <span
                        className={`inline-block text-[8.5px] px-2.5 py-0.5 rounded-full border font-bold uppercase ${
                          order.status === "IN TRANSIT"
                            ? "text-[#ff5500] border-[#ff5500]/40 bg-[#ff5500]/10"
                            : "border-current/20 opacity-70"
                        }`}
                      >
                        [{order.status}]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ArchiveCard>
          </div>
        </div>

        {/* ── Footer Bar ─────────────────────────────────────────────── */}
        <footer
          className={`px-8 sm:px-12 lg:px-14 py-4 border-t flex flex-wrap items-center justify-between gap-3 text-[9.5px] tracking-[0.18em] uppercase z-30 transition-colors ${
            isLight ? "border-black/10 bg-white/30" : "border-white/10 bg-black/30"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="shrink-0 w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[8px] font-bold">N</div>
            <span className="shrink-0 text-[#ff5500] font-bold">©</span>
            <span className="truncate">2026 [THEJERSEYHUB]</span>
          </div>
          <div className="shrink-0 flex items-center gap-6">
            <Link href="/privacy" className="opacity-50 hover:opacity-100 transition-opacity">[PRIVACY]</Link>
            <Link href="/terms" className="opacity-50 hover:opacity-100 transition-opacity">[TERMS]</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
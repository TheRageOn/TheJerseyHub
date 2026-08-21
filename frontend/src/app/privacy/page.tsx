"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";

const SECTIONS = [
  {
    id: "sec-01",
    num: "[01]",
    title: "COLLECTED DATA & IDENTIFIERS",
    content: `When you create an account or place an order, we collect essential collector credentials including full name, verified email address, contact telephone, and physical delivery coordinates. This information is utilized exclusively for order fulfillment, fraud prevention, and authenticated session management.`,
  },
  {
    id: "sec-02",
    num: "[02]",
    title: "SESSION CREDENTIALS & TOKEN ENCRYPTION",
    content: `User authentication utilizes cryptographically signed JSON Web Tokens (JWT) with standard expiration lifetimes. Passwords are never stored in plaintext and are hashed using bcrypt with salt rounds exceeding industry minimums. All client-server communications occur over TLS 1.3 encrypted conduits.`,
  },
  {
    id: "sec-03",
    num: "[03]",
    title: "PAYMENT PROCESSING & FINANCIAL SECURITY",
    content: `Financial transactions and payment credentials are processed through PCI-DSS Level 1 certified payment gateways. TheJerseyHub does not store full credit card numbers, CVVs, or sensitive banking credentials on internal servers. Only tokenized payment identifiers and settlement confirmations are recorded.`,
  },
  {
    id: "sec-04",
    num: "[04]",
    title: "HARDWARE, RENDERING & VIEWPORT TELEMETRY",
    content: `To ensure optimal 60fps performance and responsive 3D perspective shader rendering, client-side telemetry regarding device viewport dimensions, GPU capabilities, and touch input availability is processed locally in memory and is not harvested for third-party tracking.`,
  },
  {
    id: "sec-05",
    num: "[05]",
    title: "THIRD-PARTY SERVICE PROVIDERS",
    content: `We do not sell, rent, or monetize collector data. Data is shared strictly with trusted operational infrastructure partners essential for hosting, database persistence, transaction settlement, and courier dispatch under strict non-disclosure obligations.`,
  },
  {
    id: "sec-06",
    num: "[06]",
    title: "RIGHT TO ERASURE & DATA EXPORT",
    content: `Collectors retain full autonomy over their personal records. You may request a complete export of your session history and order archives, or submit a permanent data purge request by contacting our privacy compliance desk.`,
  },
];

export default function PrivacyPage() {
  const [theme, setTheme] = useState<"light" | "black">("light");

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "black" : "light"));
  }, []);

  const isLight = theme === "light";

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden transition-colors duration-700 select-none ${
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
            href="/signup"
            className={`flex items-center gap-1.5 hover:opacity-100 transition-opacity ${
              isLight ? "text-[#555]" : "text-[#777]"
            }`}
          >
            <span>←</span>
            <span>[AUTH]</span>
          </Link>
        </div>
      </header>

      {/* ── Main Legal Document ────────────────────────────────────── */}
      <main className="relative flex-1 w-full max-w-4xl mx-auto px-6 sm:px-12 py-10 lg:py-16">
        {/* Coordinate Marks */}
        <div
          className={`absolute top-8 left-6 sm:left-12 font-mono text-[10px] tracking-widest pointer-events-none ${
            isLight ? "text-black/20" : "text-white/20"
          }`}
        >
          [X]
        </div>
        <div
          className={`absolute top-8 right-6 sm:right-12 font-mono text-[10px] tracking-widest pointer-events-none ${
            isLight ? "text-black/20" : "text-white/20"
          }`}
        >
          [X]
        </div>

        {/* Document Header */}
        <div className="flex flex-col gap-2 mb-10 pb-8 border-b border-dashed border-current/20">
          <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#ff5500] uppercase">
            <span>•</span>
            <span>LEGAL ARCHIVE // 2026</span>
          </div>
          <h1 className="font-mono text-[28px] sm:text-[38px] font-bold tracking-[0.06em] uppercase text-current leading-none">
            [PRIVACY POLICY]
          </h1>
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.14em] opacity-60 uppercase mt-2">
            DATA ENCRYPTION & COLLECTOR PRIVACY PROTOCOLS // REVISION 2.4
          </p>

          {/* Quick Jump Table of Contents Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-6 font-mono text-[9.5px] sm:text-[10px] tracking-[0.14em] uppercase">
            <span className="opacity-50">JUMP TO //</span>
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-2 py-1 border border-current/20 hover:border-current/60 hover:bg-current/[0.04] transition-all"
              >
                {sec.num}
              </a>
            ))}
          </div>
        </div>

        {/* Legal Sections Stack */}
        <div className="flex flex-col gap-10">
          {SECTIONS.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="flex flex-col gap-3 scroll-mt-24"
            >
              <div className="flex items-center justify-between border-b border-dashed border-current/15 pb-2">
                <h2 className="font-mono text-[12px] sm:text-[13px] font-bold tracking-[0.16em] uppercase">
                  {`${sec.num} // ${sec.title}`}
                </h2>
                <span className="font-mono text-[9px] tracking-[0.12em] opacity-35">
                  [SECURITY.VERIFIED]
                </span>
              </div>
              <p className="font-mono text-[11.5px] sm:text-[12.5px] tracking-[0.06em] leading-relaxed opacity-75 whitespace-pre-line">
                {sec.content}
              </p>
            </section>
          ))}
        </div>

        {/* Bottom Acknowledgment Stamp */}
        <div className="mt-14 pt-8 border-t border-dashed border-current/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[10px] tracking-[0.14em] uppercase opacity-70">
          <div>EFFECTIVE DATE : [20.08.2026]</div>
          <div className="text-[#ff5500]">STATUS : [ACTIVE & ENFORCED]</div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative w-full z-40 px-6 sm:px-12 lg:px-20 py-5 sm:py-6 flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[8px] font-bold">
            N
          </div>
          <span className="text-[#ff5500] font-bold">©</span>
          <span className={isLight ? "text-black" : "text-white"}>
            2026 [THEJERSEYHUB]
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-[#ff5500] font-bold underline underline-offset-2"
          >
            [PRIVACY]
          </Link>
          <Link
            href="/terms"
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

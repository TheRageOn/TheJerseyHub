"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";

const SECTIONS = [
  {
    id: "sec-01",
    num: "[01]",
    title: "VAULT ACCESS & ACCOUNT INTEGRITY",
    content: `By initializing membership or accessing TheJerseyHub archive, you agree to comply with all security protocols, authentication parameters, and collector standards established herein. Each user account is strictly personal and non-transferable. You are solely responsible for maintaining the confidentiality of your session credentials and encryption keys.`,
  },
  {
    id: "sec-02",
    num: "[02]",
    title: "DIGITAL SPEC & AUTHENTICITY VERIFICATION",
    content: `All football kits, match-issue jerseys, and collector items cataloged on TheJerseyHub represent verified physical archive items. Digital 3D representations, shaders, and technical spec cards are provided for interactive inspection. Physical items shipped to verified members are inspected against official club match standards and manufacturer issue certifications.`,
  },
  {
    id: "sec-03",
    num: "[03]",
    title: "VALUATIONS, DROPS & ACQUISITIONS",
    content: `Prices, edition allocations, and drop release schedules are subject to real-time valuation updates reflecting historical rarity and collector index ratings. An order confirmation constitutes a binding reservation of the specified edition code. In the event of allocation conflicts during high-demand drops, priority is resolved via timestamp verification.`,
  },
  {
    id: "sec-04",
    num: "[04]",
    title: "PROPRIETARY SHADERS & INTELLECTUAL PROPERTY",
    content: `The interface, 3D interactive viewport, typography systems, sound assets, and database architecture of TheJerseyHub are protected under international copyright and intellectual property treaties. Unauthorized scraping, extraction of vector shaders, or automated replication of catalog assets without explicit license is strictly prohibited.`,
  },
  {
    id: "sec-05",
    num: "[05]",
    title: "RETURN POLICY & COLLECTOR DISPUTES",
    content: `Due to the limited and archival nature of match-issue kits, returns are accepted within 14 days of delivery provided the tamper-evident security tags remain intact and verified. Disputes regarding edition condition, sizing specs, or match authenticity are reviewed by our primary curation board.`,
  },
  {
    id: "sec-06",
    num: "[06]",
    title: "SYSTEM MODIFICATIONS & GOVERNING JURISDICTION",
    content: `TheJerseyHub reserves the right to modify these terms and authentication protocols at any time. Continued session access following posted updates constitutes acceptance of revised terms. These terms are governed under standard international commercial arbitration laws.`,
  },
];

export default function TermsPage() {
  const [theme, setTheme] = useState<"light" | "black">("light");

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "black" : "light"));
  }, []);

  const isLight = theme === "light";

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
            [TERMS OF SERVICE]
          </h1>
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.14em] opacity-60 uppercase mt-2">
            AUTHENTICATED PROTOCOLS & USER RIGHTS // REVISION 2.4
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
                  [SPEC.VERIFIED]
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
            className={`hover:opacity-100 transition-opacity ${
              isLight ? "text-[#666]" : "text-[#777]"
            }`}
          >
            [PRIVACY]
          </Link>
          <Link
            href="/terms"
            className="text-[#ff5500] font-bold underline underline-offset-2"
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

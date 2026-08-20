"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";

interface NavbarProps {
  onOpenAuth?: (mode: "login" | "signup") => void;
  onDiscoverNext?: () => void;
  isFixed?: boolean;
}

export default function Navbar({ onOpenAuth, onDiscoverNext, isFixed = true }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { isWhite, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={
        isFixed
          ? "fixed top-10 sm:top-11 lg:top-12 left-0 right-0 z-40 px-4 sm:px-8 pointer-events-none flex justify-center"
          : "w-full pt-4 sm:pt-6 pb-2 px-4 sm:px-8 flex justify-center z-10"
      }
    >
      {/* 
        Thick Editorial Navbar Container:
        - Responsive to Chalk White and Obsidian Noir themes
      */}
      <div
        className={`w-full max-w-5xl h-[68px] sm:h-[72px] backdrop-blur-xl rounded-2xl px-6 sm:px-8 flex items-center justify-between pointer-events-auto relative transition-all duration-300 ${
          isWhite
            ? "bg-[#faf7f0]/90 border border-black/10 shadow-[0_16px_45px_rgba(0,0,0,0.08)] text-[#0c0c0c]"
            : "bg-[#0c0c0c]/90 border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.65)] text-white"
        }`}
      >
        {/* Top Accent Line */}
        <div
          className={`absolute top-0 inset-x-8 h-[1px] ${
            isWhite
              ? "bg-gradient-to-r from-transparent via-black/10 to-transparent"
              : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
          }`}
        />

        {/* ── Brand Logo & Title ────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              isWhite
                ? "bg-black/5 border border-black/10 text-black shadow-sm"
                : "bg-white/10 border border-white/15 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
            }`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
            </svg>
          </div>

          <div className="flex flex-col gap-0.5">
            <span
              className={`font-mono text-xs sm:text-sm font-bold tracking-[0.18em] sm:tracking-[0.22em] ${
                isWhite ? "text-[#0a0a0a]" : "text-white"
              }`}
            >
              [THEJERSEYHUB]
            </span>
            <span
              className={`font-mono text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase hidden sm:block ${
                isWhite ? "text-black/45" : "text-white/40"
              }`}
            >
              ARCHIVE // 2026
            </span>
          </div>
        </Link>

        {/* ── Desktop Navigation Links ──────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-[10.5px] lg:text-[11px] tracking-[0.18em] uppercase">
          {pathname === "/" && onDiscoverNext && (
            <button
              onClick={onDiscoverNext}
              className={`transition-colors cursor-pointer py-1 ${
                isWhite
                  ? "text-black/70 hover:text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              DISCOVER
            </button>
          )}

          {isAuthenticated ? (
            <>
              <Link
                href="/shop"
                className={`transition-colors py-1 ${
                  pathname === "/shop"
                    ? "text-[#ff5500] font-bold"
                    : isWhite
                    ? "text-black/70 hover:text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                SHOP
              </Link>
              <Link
                href="/dashboard"
                className={`transition-colors py-1 ${
                  pathname === "/dashboard"
                    ? "text-[#ff5500] font-bold"
                    : isWhite
                    ? "text-black/70 hover:text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                VAULT
              </Link>
            </>
          ) : null}

          <span
            className={`select-none ${
              isWhite ? "text-black/20" : "text-white/20"
            }`}
          >
            •
          </span>

          <button
            onClick={toggleTheme}
            className={`hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-2 py-1 ${
              isWhite ? "text-black/75" : "text-white/70"
            }`}
          >
            <span>THEME</span>
            <span className="text-[9px] text-[#ff5500] font-bold">
              [{isWhite ? "CHALK" : "NOIR"}]
            </span>
          </button>
        </nav>

        {/* ── Right Action Controls ─────────────────────────────────── */}
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-[10.5px] sm:text-[11px] tracking-[0.14em] uppercase">
          {/* Cart Trigger Badge */}
          <button
            onClick={openCart}
            className={`px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              totalItems > 0
                ? "bg-[#ff5500]/10 border-[#ff5500]/40 text-[#ff5500] font-bold"
                : isWhite
                ? "border-black/10 hover:bg-black/5 text-black/70"
                : "border-white/10 hover:bg-white/10 text-white/70"
            }`}
            aria-label="View shopping bag"
          >
            <span>BAG</span>
            <span>[{totalItems}]</span>
          </button>

          {/* Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 font-bold ${
                  isWhite
                    ? "bg-black/5 hover:bg-black/10 text-black"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`}
              >
                <span>{user.name.split(" ")[0]}</span>
              </Link>

              <button
                onClick={logout}
                className="opacity-50 hover:opacity-100 transition-opacity px-2 py-1 cursor-pointer text-[10px]"
                title="Log out"
              >
                [EXIT]
              </button>
            </div>
          ) : (
            <>
              {onOpenAuth && (
                <>
                  <button
                    onClick={() => onOpenAuth("login")}
                    className={`px-3 sm:px-4 py-2 transition-colors cursor-pointer font-semibold ${
                      isWhite
                        ? "text-black/80 hover:text-black"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    LOG IN
                  </button>

                  <button
                    onClick={() => onOpenAuth("signup")}
                    className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(255,85,0,0.35)]"
                  >
                    SIGN UP
                  </button>
                </>
              )}
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer ml-1 ${
              isWhite
                ? "text-black/70 hover:text-black hover:bg-black/5"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* ── Mobile Menu Dropdown ──────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden absolute top-24 left-4 right-4 backdrop-blur-2xl rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 font-mono text-xs tracking-widest uppercase pointer-events-auto animate-in fade-in zoom-in-95 duration-150 ${
            isWhite
              ? "bg-[#faf7f0]/95 border border-black/10 text-black"
              : "bg-[#0c0c0c]/95 border border-white/15 text-white"
          }`}
        >
          <div
            className={`flex items-center justify-between border-b pb-3 ${
              isWhite ? "border-black/10" : "border-white/10"
            }`}
          >
            <span
              className={`text-[10px] ${
                isWhite ? "text-black/50" : "text-white/50"
              }`}
            >
              NAVIGATION MENU
            </span>
            <button
              onClick={toggleTheme}
              className="text-[#ff5500] font-bold text-[10px]"
            >
              THEME: {isWhite ? "CHALK" : "NOIR"}
            </button>
          </div>

          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 text-left hover:text-[#ff5500] transition-colors"
          >
            → SHOP MARKETPLACE
          </Link>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-left text-[#ff5500] font-bold transition-colors"
            >
              → COLLECTOR VAULT
            </Link>
          ) : (
            <div
              className={`pt-3 border-t flex flex-col gap-3 ${
                isWhite ? "border-black/10" : "border-white/10"
              }`}
            >
              <button
                onClick={() => {
                  onOpenAuth?.("login");
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-3 text-center rounded-lg transition-colors font-semibold border ${
                  isWhite
                    ? "text-black border-black/15 hover:bg-black/5"
                    : "text-white border-white/20 hover:bg-white/10"
                }`}
              >
                LOG IN
              </button>
              <button
                onClick={() => {
                  onOpenAuth?.("signup");
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 text-center bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-bold rounded-lg shadow-[0_0_15px_rgba(255,85,0,0.4)]"
              >
                SIGN UP
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

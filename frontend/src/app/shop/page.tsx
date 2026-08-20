"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { JERSEYS, Jersey } from "@/data/jerseys";
import Navbar from "@/components/landing/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import ContactModal from "@/components/contact/ContactModal";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 6;

// Extended 12-kit catalog for multi-page archive exploration
const EXTENDED_CATALOG: (Jersey & {
  category: "club" | "retro" | "special" | "vintage";
  league: "La Liga" | "Premier League" | "Serie A" | "Vintage Archive";
  sizesAvailable: ("S" | "M" | "L" | "XL" | "XXL")[];
  rating: number;
  inStock: boolean;
})[] = [
  {
    ...JERSEYS[0],
    category: "club",
    league: "La Liga",
    sizesAvailable: ["S", "M", "L", "XL"],
    rating: 4.9,
    inStock: true,
  },
  {
    ...JERSEYS[1],
    category: "club",
    league: "La Liga",
    sizesAvailable: ["M", "L", "XL", "XXL"],
    rating: 4.8,
    inStock: true,
  },
  {
    ...JERSEYS[2],
    category: "club",
    league: "Premier League",
    sizesAvailable: ["S", "M", "L", "XL"],
    rating: 4.9,
    inStock: true,
  },
  {
    ...JERSEYS[3],
    category: "club",
    league: "Premier League",
    sizesAvailable: ["S", "M", "L", "XL", "XXL"],
    rating: 4.7,
    inStock: true,
  },
  {
    id: "man-utd-98-99",
    code: "05/MUFC-TREBLE",
    name: "MAN UTD 98/99 TREBLE WINNERS",
    season: "98/99 VINTAGE FINAL SPEC",
    price: "$165.00",
    imageSrc: "/images/manchester-united-jersey.svg",
    edition: "HERITAGE VAULT EDITION",
    club: "MANCHESTER UNITED",
    category: "vintage",
    league: "Vintage Archive",
    sizesAvailable: ["M", "L", "XL"],
    rating: 5.0,
    inStock: true,
  },
  {
    id: "arsenal-invincibles",
    code: "06/ARS-0304",
    name: "ARSENAL 03/04 THE INVINCIBLES",
    season: "03/04 COMMEMORATIVE SPEC",
    price: "$150.00",
    imageSrc: "/images/arsenal-jersey.svg",
    edition: "HERITAGE MATCH RUN",
    club: "ARSENAL FC",
    category: "retro",
    league: "Vintage Archive",
    sizesAvailable: ["S", "M", "L", "XL"],
    rating: 4.9,
    inStock: true,
  },
  {
    id: "ac-milan-0607",
    code: "07/ACM-UCL",
    name: "AC MILAN 06/07 ATHENS UCL FINAL",
    season: "06/07 FINALIST MATCH SPEC",
    price: "$155.00",
    imageSrc: "/images/barca-jersey.svg",
    edition: "ROUGE & NOIR ARCHIVE",
    club: "AC MILAN",
    category: "vintage",
    league: "Serie A",
    sizesAvailable: ["S", "M", "L", "XL"],
    rating: 4.9,
    inStock: true,
  },
  {
    id: "inter-0910",
    code: "08/INT-TREBLE",
    name: "INTER MILAN 09/10 HISTORIC TREBLE",
    season: "09/10 BERNABÉU WINNER SPEC",
    price: "$145.00",
    imageSrc: "/images/real-jersey.svg",
    edition: "NERAZZURRI COMMEMORATIVE",
    club: "INTER MILAN",
    category: "vintage",
    league: "Serie A",
    sizesAvailable: ["M", "L", "XL"],
    rating: 5.0,
    inStock: true,
  },
  {
    id: "real-madrid-galacticos",
    code: "09/RMA-0203",
    name: "REAL MADRID 02/03 CENTENARIO",
    season: "02/03 100TH CENTURY EDITION",
    price: "$160.00",
    imageSrc: "/images/real-jersey.svg",
    edition: "BLANCO HERITAGE RUN",
    club: "REAL MADRID CF",
    category: "retro",
    league: "La Liga",
    sizesAvailable: ["S", "M", "L", "XL", "XXL"],
    rating: 4.9,
    inStock: true,
  },
  {
    id: "barca-0809-sextuple",
    code: "10/FCB-0809",
    name: "FC BARCELONA 08/09 SEXTUPLE",
    season: "08/09 HISTORIC ROME RUN",
    price: "$155.00",
    imageSrc: "/images/barca-jersey.svg",
    edition: "BLAUGRANA IMMORTAL",
    club: "FC BARCELONA",
    category: "retro",
    league: "La Liga",
    sizesAvailable: ["S", "M", "L", "XL"],
    rating: 5.0,
    inStock: true,
  },
  {
    id: "arsenal-bruised-banana",
    code: "11/ARS-9193",
    name: "ARSENAL 91/93 BRUISED BANANA",
    season: "91/93 ICONIC AWAY RUN",
    price: "$175.00",
    imageSrc: "/images/arsenal-jersey.svg",
    edition: "CULT RETRO DROP",
    club: "ARSENAL FC",
    category: "vintage",
    league: "Vintage Archive",
    sizesAvailable: ["M", "L", "XL"],
    rating: 4.9,
    inStock: true,
  },
  {
    id: "man-utd-9496-cantona",
    code: "12/MUFC-CANTONA",
    name: "MAN UTD 94/96 CANTONA COLLAR",
    season: "94/96 OLD TRAFFORD SPEC",
    price: "$170.00",
    imageSrc: "/images/manchester-united-jersey.svg",
    edition: "KING ARCHIVE SPEC",
    club: "MANCHESTER UNITED",
    category: "vintage",
    league: "Vintage Archive",
    sizesAvailable: ["S", "M", "L", "XL"],
    rating: 5.0,
    inStock: true,
  },
];

export default function ShopPage() {
  const { isWhite, theme } = useTheme();
  const { addToCart, openCart } = useCart();
  const { user, isAuthenticated, loading } = useAuth();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLeague, setSelectedLeague] = useState<string>("ALL");
  const [selectedSize, setSelectedSize] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [currentPage, setCurrentPage] = useState(1);

  // Selected kit sizes on card
  const [cardSizes, setCardSizes] = useState<Record<string, "S" | "M" | "L" | "XL" | "XXL">>({
    "barca-24-25": "L",
    "real-madrid-24-25": "L",
    "arsenal-24-25": "L",
    "man-utd-24-25": "L",
    "man-utd-98-99": "L",
    "arsenal-invincibles": "L",
    "ac-milan-0607": "L",
    "inter-0910": "L",
    "real-madrid-galacticos": "L",
    "barca-0809-sextuple": "L",
    "arsenal-bruised-banana": "L",
    "man-utd-9496-cantona": "L",
  });

  // Modals
  const [inspectJersey, setInspectJersey] = useState<typeof EXTENDED_CATALOG[0] | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const displayName = user?.name ? user.name.toUpperCase() : "COLLECTOR";

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const filteredKits = useMemo(() => {
    return EXTENDED_CATALOG.filter((item) => {
      // Search
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.club.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.season.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category
      if (selectedCategory !== "ALL" && item.category !== selectedCategory.toLowerCase()) {
        return false;
      }
      // League
      if (selectedLeague !== "ALL" && item.league !== selectedLeague) {
        return false;
      }
      // Size
      if (
        selectedSize !== "ALL" &&
        !item.sizesAvailable.includes(selectedSize as "S" | "M" | "L" | "XL" | "XXL")
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const pA = parseFloat(a.price.replace(/[^0-9.]/g, ""));
      const pB = parseFloat(b.price.replace(/[^0-9.]/g, ""));
      if (sortBy === "price-asc") return pA - pB;
      if (sortBy === "price-desc") return pB - pA;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedLeague, selectedSize, sortBy]);

  // Pagination calculation (strictly 6 items per page)
  const totalPages = Math.ceil(filteredKits.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = currentPage > totalPages ? 1 : currentPage;

  const paginatedKits = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredKits.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredKits, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auth-gated view if user is not logged in
  if (!loading && !isAuthenticated) {
    return (
      <main
        className={`min-h-screen w-full flex flex-col items-center justify-center p-6 text-center transition-colors duration-500 ${
          isWhite ? "theme-white bg-[#faf7f0] text-[#0c0c0c]" : "theme-black bg-[#060606] text-white"
        }`}
      >
        <div className="film-grain" style={{ opacity: isWhite ? 0.28 : 0.18 }} />
        
        {/* Navbar */}
        <Navbar onOpenAuth={handleOpenAuth} isFixed={false} />

        <div
          className={`relative max-w-lg w-full rounded-3xl p-8 sm:p-10 border shadow-2xl space-y-6 my-auto ${
            isWhite ? "bg-white/80 border-black/10" : "bg-[#101014] border-white/12"
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-[#ff5500] uppercase font-bold">
                COLLECTOR ACCESS RESTRICTED
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Vault Marketplace Gated
            </h1>
            <p className="text-xs opacity-60 max-w-sm mx-auto leading-relaxed">
              Authentic match-issue drops and private archive catalogs are exclusively open to verified collectors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => handleOpenAuth("login")}
              className="flex-1 h-12 bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(255,85,0,0.35)] cursor-pointer"
            >
              Log In to Enter
            </button>
            <button
              onClick={() => handleOpenAuth("signup")}
              className={`flex-1 h-12 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                isWhite
                  ? "border-black/15 hover:bg-black/5 text-black"
                  : "border-white/20 hover:bg-white/10 text-white"
              }`}
            >
              Register Account
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          theme={theme}
          onClose={() => setAuthModalOpen(false)}
        />
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen w-full transition-colors duration-500 ${
        isWhite ? "theme-white bg-[#faf7f0] text-[#0c0c0c]" : "theme-black bg-[#060606] text-white"
      }`}
    >
      {/* Tactile Film Grain */}
      <div className="film-grain" style={{ opacity: isWhite ? 0.28 : 0.18 }} />

      {/* Top Ticker Header (Non-persistent: scrolls naturally with page) */}
      <div
        className={`w-full h-8 border-b flex items-center justify-between px-6 sm:px-10 text-[8.5px] sm:text-[9.5px] font-mono tracking-[0.18em] uppercase select-none transition-colors ${
          isWhite
            ? "bg-[#faf7f0] border-black/10 text-[#0c0c0c]"
            : "bg-[#070707] border-white/10 text-white"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
          <span>MARKETPLACE // IMMERSIVE FOOTBALL ARCHIVE // 2026</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs opacity-50 font-mono">
          <Link href="/dashboard" className="hover:text-[#ff5500] transition-colors">
            ← BACK TO VAULT
          </Link>
          <span>•</span>
          <span>AUTHENTIC PRO ISSUE</span>
        </div>
      </div>

      {/* Editorial Navbar (Non-persistent: scrolls naturally with top of shop) */}
      <Navbar onOpenAuth={handleOpenAuth} isFixed={false} />

      {/* ── Main Catalog Layout with Persistent Left Dock + Persistent Filter Sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-24 flex gap-6 sm:gap-8 items-start">
        
        {/* Left Persistent Icon Dock */}
        <aside
          className={`w-14 sm:w-16 rounded-3xl p-3 sm:p-4 border flex flex-col items-center justify-between shrink-0 h-[640px] sticky top-6 z-30 self-start transition-all ${
            isWhite
              ? "bg-white/90 backdrop-blur-xl border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
              : "bg-[#101014]/90 backdrop-blur-xl border-white/10 shadow-2xl"
          }`}
        >
          {/* User Initial Avatar Badge */}
          <div className="w-9 h-9 rounded-2xl bg-[#ff5500] text-white font-mono font-bold text-xs flex items-center justify-center shadow-md">
            {displayName[0] || "C"}
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col gap-4 text-sm">
            {/* Shop Active */}
            <Link
              href="/shop"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#ff5500] text-white shadow-sm"
              title="Shop Marketplace (Active)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>

            {/* Vault Link */}
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-xl flex items-center justify-center opacity-40 hover:opacity-100 hover:text-[#ff5500] transition-all cursor-pointer"
              title="Collector Vault"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            {/* Bag Drawer */}
            <button
              onClick={openCart}
              className="w-9 h-9 rounded-xl flex items-center justify-center opacity-40 hover:opacity-100 transition-all cursor-pointer"
              title="Open Shopping Bag"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>

          {/* Contact Support */}
          <button
            onClick={() => setContactModalOpen(true)}
            className="w-8 h-8 rounded-xl opacity-40 hover:opacity-100 flex items-center justify-center text-xs font-mono"
            title="Contact Support"
          >
            ?
          </button>
        </aside>

        {/* ── Center & Right Area: Filters + Product Grid ──────────── */}
        <div className="flex-1 space-y-8">
          
          {/* Header Title & Breadcrumb */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-black/10 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#ff5500] uppercase mb-1">
                <Link href="/dashboard" className="hover:underline">VAULT REPOSITORY</Link>
                <span>/</span>
                <span>AUTHENTIC KITS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Kit Archive // 2026
              </h1>
              <p className="text-xs opacity-60 mt-1 max-w-xl">
                Curated player-issue specifications, historic anniversary kits, and rare collector editions.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div
              className={`px-4 py-2 rounded-xl font-mono text-xs border flex items-center gap-3 ${
                isWhite ? "bg-white/80 border-black/10 shadow-sm" : "bg-[#121216] border-white/10"
              }`}
            >
              <span className="opacity-60">AVAILABLE KITS:</span>
              <span className="font-bold text-[#ff5500]">{filteredKits.length} EDITIONS</span>
            </div>
          </div>

          {/* ── Filter Bar & Controls ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Sticky Filter Sidebar (Persists on scroll) */}
            <aside className="lg:col-span-1 space-y-6 sticky top-6 z-20 self-start">
              <div
                className={`p-6 rounded-3xl border transition-all ${
                  isWhite
                    ? "bg-white/90 backdrop-blur-xl border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
                    : "bg-[#101014]/90 backdrop-blur-xl border-white/10 shadow-xl"
                }`}
              >
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Filters
                  </span>
                  {(searchQuery || selectedCategory !== "ALL" || selectedLeague !== "ALL" || selectedSize !== "ALL") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("ALL");
                        setSelectedLeague("ALL");
                        setSelectedSize("ALL");
                      }}
                      className="text-[10px] font-mono text-[#ff5500] hover:underline cursor-pointer"
                    >
                      RESET
                    </button>
                  )}
                </div>

                {/* Search Field */}
                <div className="space-y-2 mb-5">
                  <label className="block text-[10.5px] font-mono font-medium uppercase tracking-wider opacity-60">
                    Search Kits
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Barcelona, Cannon, Treble..."
                      className={`w-full h-10 pl-3.5 pr-8 rounded-xl text-xs outline-none transition-colors ${
                        isWhite
                          ? "bg-[#faf7f0] border border-black/10 focus:border-[#ff5500]"
                          : "bg-[#18181e] border border-white/10 text-white focus:border-[#ff5500]"
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2 mb-5">
                  <label className="block text-[10.5px] font-mono font-medium uppercase tracking-wider opacity-60">
                    Edition Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["ALL", "CLUB", "RETRO", "VINTAGE"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-2 px-2.5 rounded-xl font-mono text-[10.5px] text-center transition-all cursor-pointer border ${
                          selectedCategory === cat
                            ? "bg-[#ff5500] text-white border-[#ff5500] font-bold shadow-sm"
                            : isWhite
                            ? "bg-black/5 hover:bg-black/10 border-transparent text-black/75"
                            : "bg-white/5 hover:bg-white/10 border-transparent text-white/75"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* League Filter */}
                <div className="space-y-2 mb-5">
                  <label className="block text-[10.5px] font-mono font-medium uppercase tracking-wider opacity-60">
                    League / Era
                  </label>
                  <div className="space-y-1">
                    {["ALL", "La Liga", "Premier League", "Serie A", "Vintage Archive"].map((lg) => (
                      <button
                        key={lg}
                        onClick={() => setSelectedLeague(lg)}
                        className={`w-full text-left py-2 px-3 rounded-xl font-mono text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                          selectedLeague === lg
                            ? isWhite
                              ? "bg-black text-white font-bold"
                              : "bg-white text-black font-bold"
                            : "opacity-65 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{lg}</span>
                        {selectedLeague === lg && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-2">
                  <label className="block text-[10.5px] font-mono font-medium uppercase tracking-wider opacity-60">
                    Size Availability
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["ALL", "S", "M", "L", "XL", "XXL"].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-9 h-9 rounded-xl font-mono text-xs flex items-center justify-center transition-all cursor-pointer border ${
                          selectedSize === sz
                            ? "bg-[#ff5500] text-white border-[#ff5500] font-bold shadow-sm"
                            : isWhite
                            ? "bg-black/5 hover:bg-black/10 border-black/10 text-black/75"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-white/75"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </aside>

            {/* Right Product Grid Area */}
            <section className="lg:col-span-3 space-y-6">
              {/* Sort Bar */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs opacity-60">
                  SHOWING {paginatedKits.length} OF {filteredKits.length} KITS • PAGE {currentPage} OF {totalPages}
                </span>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="opacity-50">SORT:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc")}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-mono outline-none cursor-pointer ${
                      isWhite
                        ? "bg-white border-black/10 text-black"
                        : "bg-[#141418] border-white/10 text-white"
                    }`}
                  >
                    <option value="featured">Featured Archive</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Grid Cards (Strictly 6 Kits per page) */}
              {paginatedKits.length === 0 ? (
                <div
                  className={`py-20 rounded-3xl border text-center font-mono space-y-3 ${
                    isWhite ? "bg-white border-black/10" : "bg-[#101014] border-white/10"
                  }`}
                >
                  <p className="text-sm font-bold opacity-60">NO KITS FOUND MATCHING FILTERS</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                      setSelectedLeague("ALL");
                      setSelectedSize("ALL");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#ff5500] text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedKits.map((kit) => {
                    const currentSelectedSize = cardSizes[kit.id] || "L";

                    return (
                      <div
                        key={kit.id}
                        className={`group rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between relative ${
                          isWhite
                            ? "bg-white/80 hover:bg-white border-black/10 hover:border-black/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                            : "bg-[#121216]/90 hover:bg-[#16161c] border-white/10 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                        }`}
                      >
                        {/* Top Header Row on Card */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-[9px] px-2.5 py-1 rounded-md bg-[#ff5500]/10 text-[#ff5500] font-bold tracking-wider">
                            {kit.code}
                          </span>

                          <div className="flex items-center gap-1 font-mono text-[10px] opacity-70">
                            <span>★ {kit.rating}</span>
                          </div>
                        </div>

                        {/* Jersey Image Showcase */}
                        <div
                          onClick={() => setInspectJersey(kit)}
                          className="relative w-full h-56 my-2 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform duration-300"
                        >
                          <Image
                            src={kit.imageSrc}
                            alt={kit.name}
                            fill
                            className="object-contain drop-shadow-xl"
                          />
                        </div>

                        {/* Kit Meta Details */}
                        <div className="pt-3">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#ff5500] font-semibold block mb-0.5">
                            {kit.club}
                          </span>
                          <h3
                            onClick={() => setInspectJersey(kit)}
                            className="font-bold text-sm leading-snug cursor-pointer hover:text-[#ff5500] transition-colors truncate"
                            title={kit.name}
                          >
                            {kit.name}
                          </h3>
                          <p className="font-mono text-[10px] opacity-50 mt-0.5 mb-3 truncate">
                            {kit.season}
                          </p>

                          {/* Interactive Size Pill Selector */}
                          <div className="flex items-center gap-1.5 mb-4">
                            <span className="font-mono text-[9px] opacity-50 mr-1">SIZE:</span>
                            {(["S", "M", "L", "XL"] as const).map((sz) => (
                              <button
                                key={sz}
                                onClick={() =>
                                  setCardSizes((prev) => ({ ...prev, [kit.id]: sz }))
                                }
                                className={`w-7 h-7 rounded-lg font-mono text-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                                  currentSelectedSize === sz
                                  ? "bg-[#ff5500] text-white border-[#ff5500] font-bold"
                                  : isWhite
                                  ? "bg-black/5 hover:bg-black/10 border-black/10 text-black/70"
                                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>

                          {/* Price & Action Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
                            <div>
                              <span className="font-mono text-[9px] opacity-50 block leading-none">
                                VALUATION
                              </span>
                              <span className="font-mono text-base font-bold text-[#ff5500]">
                                {kit.price}
                              </span>
                            </div>

                            <button
                              onClick={() => addToCart(kit, currentSelectedSize, 1)}
                              className="px-4 py-2.5 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_14px_rgba(255,85,0,0.35)] cursor-pointer active:scale-95"
                            >
                              + ADD TO BAG
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Editorial Pagination Controls ───────────────────────── */}
              {totalPages > 1 && (
                <div
                  className={`mt-10 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs transition-all ${
                    isWhite
                      ? "bg-white/80 border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <button
                    disabled={safeCurrentPage === 1}
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-30 hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
                  >
                    ← PREVIOUS
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => handlePageChange(pg)}
                        className={`w-9 h-9 rounded-xl font-bold transition-all cursor-pointer border ${
                          safeCurrentPage === pg
                            ? "bg-[#ff5500] text-white border-[#ff5500] shadow-[0_2px_10px_rgba(255,85,0,0.4)]"
                            : isWhite
                            ? "bg-black/5 hover:bg-black/10 border-black/10 text-black/70"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70"
                        }`}
                      >
                        {String(pg).padStart(2, "0")}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-30 hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed font-bold"
                  >
                    NEXT →
                  </button>
                </div>
              )}

            </section>

          </div>
        </div>

      </div>

      {/* ── Quick Inspect Modal ─────────────────────────────────────── */}
      {inspectJersey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setInspectJersey(null)}
        >
          <div
            className={`relative w-full max-w-2xl rounded-3xl p-8 sm:p-9 transition-all duration-300 ${
              isWhite
                ? "border border-black/10 text-[#0f0f0f] shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
                : "border border-white/12 text-white shadow-[0_30px_90px_rgba(0,0,0,0.9)]"
            }`}
            style={{
              background: isWhite
                ? "radial-gradient(ellipse at 50% 0%, #ffffff 0%, #fbf8f2 50%, #f0eadc 100%)"
                : "radial-gradient(ellipse at 50% 0%, #1e1e24 0%, #101013 55%, #070709 100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setInspectJersey(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full text-sm opacity-50 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative w-full h-72 flex items-center justify-center">
                <Image
                  src={inspectJersey.imageSrc}
                  alt={inspectJersey.name}
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#ff5500] font-bold uppercase">
                    SPECIFICATION // {inspectJersey.code}
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight mt-1">
                    {inspectJersey.name}
                  </h2>
                  <p className="text-xs opacity-60 font-mono mt-0.5">
                    {inspectJersey.season}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border font-mono text-[11px] space-y-2 ${
                    isWhite ? "bg-black/5 border-black/10" : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="opacity-60">EDITION:</span>
                    <span className="font-bold">{inspectJersey.edition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">FABRICATION:</span>
                    <span>100% RECYCLED POLYESTER PRO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">STATUS:</span>
                    <span className="text-emerald-500 font-bold">VERIFIED IN VAULT</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-2xl font-bold text-[#ff5500]">
                    {inspectJersey.price}
                  </span>

                  <button
                    onClick={() => {
                      addToCart(inspectJersey, cardSizes[inspectJersey.id] || "L", 1);
                      setInspectJersey(null);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(255,85,0,0.35)] cursor-pointer"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className={`w-full border-t py-8 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs opacity-70 ${
          isWhite ? "border-black/10 bg-[#f4efe5]" : "border-white/10 bg-[#070709]"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[#ff5500] font-bold">©</span>
          <span>2026 [THEJERSEYHUB] IMMERSIVE ARCHIVE</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="hover:text-[#ff5500] transition-colors">
            COLLECTOR VAULT
          </Link>
          <button
            onClick={() => setContactModalOpen(true)}
            className="hover:text-[#ff5500] transition-colors cursor-pointer"
          >
            CONTACT DESK
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        theme={theme}
        onClose={() => setAuthModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        theme={theme}
        onClose={() => setContactModalOpen(false)}
      />
    </main>
  );
}

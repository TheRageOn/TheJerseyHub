"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import AuthModal from "@/components/auth/AuthModal";
import ContactModal from "@/components/contact/ContactModal";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { productService, DBJersey, FALLBACK_CATALOG } from "@/services/productService";

const ITEMS_PER_PAGE = 6;

export default function ShopPage() {
  const { isWhite, theme } = useTheme();
  const { addToCart, openCart } = useCart();
  const { user, isAuthenticated, loading } = useAuth();

  // Dynamic Catalog State from MongoDB (with fallback)
  const [catalog, setCatalog] = useState<DBJersey[]>(() =>
    FALLBACK_CATALOG.filter((j) => j.showInShop)
  );

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLeague, setSelectedLeague] = useState<string>("ALL");
  const [selectedSize, setSelectedSize] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Selected kit sizes on card
  const [cardSizes, setCardSizes] = useState<Record<string, "S" | "M" | "L" | "XL" | "XXL">>({});

  // Modals
  const [inspectJersey, setInspectJersey] = useState<DBJersey | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Fetch real-time products from MongoDB backend on mount
  useEffect(() => {
    productService.getShopJerseys().then((data) => {
      if (data && data.length > 0) {
        setCatalog(data);
      }
    });
  }, []);

  // ESC key to dismiss inspect modal
  useEffect(() => {
    if (!inspectJersey) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspectJersey(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectJersey]);

  const displayName = user?.name ? user.name.toUpperCase() : "COLLECTOR";

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const filteredKits = useMemo(() => {
    return catalog.filter((item) => {
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
  }, [catalog, searchQuery, selectedCategory, selectedLeague, selectedSize, sortBy]);

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

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== "ALL" ? 1 : 0) +
    (selectedLeague !== "ALL" ? 1 : 0) +
    (selectedSize !== "ALL" ? 1 : 0);

  // Auth-gated view if user is not logged in
  if (!loading && !isAuthenticated) {
    return (
      <main
        className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 text-center transition-colors duration-500 ${
          isWhite ? "theme-white bg-[#faf7f0] text-[#0c0c0c]" : "theme-black bg-[#060606] text-white"
        }`}
      >
        <div className="film-grain" style={{ opacity: isWhite ? 0.28 : 0.18 }} />
        
        {/* Navbar */}
        <Navbar onOpenAuth={handleOpenAuth} isFixed={false} />

        <div
          className={`relative max-w-lg w-full rounded-3xl p-6 sm:p-10 border shadow-2xl space-y-6 my-auto ${
            isWhite ? "bg-white/80 border-black/10" : "bg-[#101014] border-white/12"
          }`}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
              <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-[#ff5500] uppercase font-bold">
                COLLECTOR ACCESS RESTRICTED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Vault Marketplace Gated
            </h1>
            <p className="text-xs opacity-60 max-w-sm mx-auto leading-relaxed">
              Authentic match-issue drops and private archive catalogs are exclusively open to verified collectors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => handleOpenAuth("login")}
              className="w-full sm:flex-1 h-12 bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(255,85,0,0.35)] cursor-pointer"
            >
              Log In to Enter
            </button>
            <button
              onClick={() => handleOpenAuth("signup")}
              className={`w-full sm:flex-1 h-12 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
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
      className={`min-h-screen w-full transition-colors duration-500 pb-20 md:pb-0 ${
        isWhite ? "theme-white bg-[#faf7f0] text-[#0c0c0c]" : "theme-black bg-[#060606] text-white"
      }`}
    >
      {/* Tactile Film Grain */}
      <div className="film-grain" style={{ opacity: isWhite ? 0.28 : 0.18 }} />

      {/* Top Ticker Header (Non-persistent: scrolls naturally with page) */}
      <div
        className={`w-full h-8 border-b flex items-center justify-between px-4 sm:px-10 text-[8px] sm:text-[9.5px] font-mono tracking-[0.16em] sm:tracking-[0.18em] uppercase select-none transition-colors ${
          isWhite
            ? "bg-[#faf7f0] border-black/10 text-[#0c0c0c]"
            : "bg-[#070707] border-white/10 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
          <span className="truncate">MARKETPLACE // IMMERSIVE ARCHIVE // 2026</span>
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

      {/* ── Main Catalog Layout with Persistent Left Dock + Filter Sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 pb-20 flex gap-6 sm:gap-8 items-start">
        
        {/* Left Persistent Icon Dock (Desktop / Tablet) */}
        <aside
          className={`hidden md:flex w-14 sm:w-16 rounded-3xl p-3 sm:p-4 border flex-col items-center justify-between shrink-0 h-[640px] sticky top-6 z-30 self-start transition-all ${
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
        <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          
          {/* Header Title & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-5 border-black/10 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 text-[9.5px] sm:text-[10px] font-mono tracking-widest text-[#ff5500] uppercase mb-1">
                <Link href="/dashboard" className="hover:underline">VAULT REPOSITORY</Link>
                <span>/</span>
                <span>AUTHENTIC KITS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Kit Archive // 2026
              </h1>
              <p className="text-xs opacity-60 mt-1 max-w-xl">
                Curated player-issue specifications, historic anniversary kits, and rare collector editions.
              </p>
            </div>

            {/* Mobile Filter & Stats Bar */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-1">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className={`lg:hidden px-3.5 py-2 rounded-xl font-mono text-xs font-bold uppercase border flex items-center gap-2 transition-all cursor-pointer ${
                  activeFiltersCount > 0
                    ? "bg-[#ff5500] text-white border-[#ff5500]"
                    : isWhite
                    ? "bg-white border-black/15 text-black"
                    : "bg-[#141418] border-white/15 text-white"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
              </button>

              <div
                className={`px-3 sm:px-4 py-2 rounded-xl font-mono text-xs border flex items-center gap-2 ${
                  isWhite ? "bg-white/80 border-black/10 shadow-sm" : "bg-[#121216] border-white/10"
                }`}
              >
                <span className="opacity-60 hidden sm:inline">AVAILABLE:</span>
                <span className="font-bold text-[#ff5500]">{filteredKits.length} KITS</span>
              </div>
            </div>
          </div>

          {/* ── Filter Bar & Controls ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
            
            {/* Filter Sidebar (Collapsible on Mobile, Sticky on Desktop) */}
            <aside
              className={`lg:col-span-1 space-y-6 ${
                mobileFilterOpen ? "block" : "hidden lg:block"
              } lg:sticky lg:top-6 z-20 self-start animate-in fade-in duration-200`}
            >
              <div
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isWhite
                    ? "bg-white/95 backdrop-blur-xl border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
                    : "bg-[#101014]/95 backdrop-blur-xl border-white/10 shadow-xl"
                }`}
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-black/10 dark:border-white/10 mb-4 sm:mb-5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Filters & Search
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("ALL");
                        setSelectedLeague("ALL");
                        setSelectedSize("ALL");
                      }}
                      className="text-[10px] font-mono text-[#ff5500] hover:underline cursor-pointer"
                    >
                      RESET ALL
                    </button>
                  )}
                </div>

                {/* Search Field */}
                <div className="space-y-1.5 mb-4 sm:mb-5">
                  <label className="block text-[10px] font-mono font-medium uppercase tracking-wider opacity-60">
                    Search Kits
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Barcelona, Treble..."
                      className={`w-full h-10 pl-3.5 pr-8 rounded-xl text-xs outline-none transition-colors ${
                        isWhite
                          ? "bg-[#faf7f0] border border-black/10 focus:border-[#ff5500]"
                          : "bg-[#18181e] border border-white/10 text-white focus:border-[#ff5500]"
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5 mb-4 sm:mb-5">
                  <label className="block text-[10px] font-mono font-medium uppercase tracking-wider opacity-60">
                    Edition Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["ALL", "CLUB", "RETRO", "VINTAGE"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-2 px-2 rounded-xl font-mono text-[10px] text-center transition-all cursor-pointer border min-h-[38px] flex items-center justify-center ${
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
                <div className="space-y-1.5 mb-4 sm:mb-5">
                  <label className="block text-[10px] font-mono font-medium uppercase tracking-wider opacity-60">
                    League / Era
                  </label>
                  <div className="space-y-1">
                    {["ALL", "La Liga", "Premier League", "Serie A", "Vintage Archive"].map((lg) => (
                      <button
                        key={lg}
                        onClick={() => setSelectedLeague(lg)}
                        className={`w-full text-left py-2 px-3 rounded-xl font-mono text-[10.5px] transition-all cursor-pointer flex items-center justify-between min-h-[36px] ${
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
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-medium uppercase tracking-wider opacity-60">
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

                {/* Close Drawer Button on Mobile */}
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="lg:hidden w-full py-2.5 mt-4 rounded-xl bg-[#ff5500] text-white font-mono text-xs font-bold uppercase tracking-wider"
                >
                  Apply Filters ({filteredKits.length} Kits)
                </button>
              </div>
            </aside>

            {/* Right Product Grid Area */}
            <section className="lg:col-span-3 space-y-6">
              {/* Sort Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="font-mono text-[11px] sm:text-xs opacity-60">
                  PAGE {safeCurrentPage} OF {totalPages} • {filteredKits.length} EDITIONS
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
                  className={`py-16 sm:py-20 rounded-3xl border text-center font-mono space-y-3 p-6 ${
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
                    className="px-4 py-2.5 rounded-xl bg-[#ff5500] text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedKits.map((kit) => {
                    const kitKey = kit._id || kit.id || kit.code;
                    const currentSelectedSize = cardSizes[kitKey] || "L";

                    return (
                      <div
                        key={kitKey}
                        className={`group rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between relative ${
                          isWhite
                            ? "bg-white/80 hover:bg-white border-black/10 hover:border-black/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                            : "bg-[#121216]/90 hover:bg-[#16161c] border-white/10 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                        }`}
                      >
                        {/* Top Header Row on Card */}
                        <div className="flex items-center justify-between mb-3">
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
                          className="relative w-full h-48 sm:h-56 my-2 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform duration-300"
                        >
                          <Image
                            src={kit.imageSrc}
                            alt={kit.name}
                            fill
                            className="object-contain drop-shadow-xl"
                          />
                        </div>

                        {/* Kit Meta Details */}
                        <div className="pt-2">
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
                          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                            <span className="font-mono text-[9px] opacity-50 mr-1 shrink-0">SIZE:</span>
                            {(["S", "M", "L", "XL"] as const).map((sz) => (
                              <button
                                key={sz}
                                onClick={() =>
                                  setCardSizes((prev) => ({ ...prev, [kitKey]: sz }))
                                }
                                className={`w-8 h-8 rounded-lg font-mono text-[10.5px] flex items-center justify-center transition-all cursor-pointer border shrink-0 ${
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
                              <span className="font-mono text-[8.5px] opacity-50 block leading-none">
                                VALUATION
                              </span>
                              <span className="font-mono text-base font-bold text-[#ff5500]">
                                {kit.price}
                              </span>
                            </div>

                            <button
                              onClick={() => addToCart(kit, currentSelectedSize, 1)}
                              className="px-4 py-2.5 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_14px_rgba(255,85,0,0.35)] cursor-pointer active:scale-95 min-h-[40px] flex items-center justify-center"
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
                  className={`mt-8 sm:mt-10 p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 font-mono text-xs transition-all ${
                    isWhite
                      ? "bg-white/80 border-black/10 shadow-sm"
                      : "bg-[#101014] border-white/10"
                  }`}
                >
                  <button
                    disabled={safeCurrentPage === 1}
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-30 hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed font-bold min-h-[40px]"
                  >
                    ← PREVIOUS
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => handlePageChange(pg)}
                        className={`w-9 h-9 rounded-xl font-bold transition-all cursor-pointer border flex items-center justify-center ${
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
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-30 hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed font-bold min-h-[40px]"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setInspectJersey(null)}
        >
          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-9 transition-all duration-300 ${
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
            {/* Top Close Button (Prominent & High Z-Index) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInspectJersey(null);
              }}
              className={`absolute top-4 right-4 sm:top-6 sm:right-6 z-30 w-10 h-10 flex items-center justify-center rounded-2xl transition-all cursor-pointer font-mono text-sm border ${
                isWhite
                  ? "bg-black/5 hover:bg-black/15 text-black border-black/10 shadow-sm"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15 shadow-sm"
              }`}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center pt-2 sm:pt-0">
              <div className="relative w-full h-56 sm:h-72 flex items-center justify-center">
                <Image
                  src={inspectJersey.imageSrc}
                  alt={inspectJersey.name}
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[9.5px] sm:text-[10px] font-mono tracking-widest text-[#ff5500] font-bold uppercase">
                    SPECIFICATION // {inspectJersey.code}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                    {inspectJersey.name}
                  </h2>
                  <p className="text-xs opacity-60 font-mono mt-0.5">
                    {inspectJersey.season}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border font-mono text-[10.5px] sm:text-[11px] space-y-2 ${
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

                <div className="flex items-center justify-between pt-2 gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#ff5500]">
                    {inspectJersey.price}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectJersey(null)}
                      className={`px-3.5 py-3 rounded-xl font-mono text-xs border transition-colors cursor-pointer ${
                        isWhite
                          ? "border-black/15 hover:bg-black/5 text-black"
                          : "border-white/20 hover:bg-white/10 text-white"
                      }`}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(inspectJersey, cardSizes[inspectJersey._id || inspectJersey.id || inspectJersey.code] || "L", 1);
                        setInspectJersey(null);
                      }}
                      className="px-5 sm:px-6 py-3 bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_6px_20px_rgba(255,85,0,0.35)] cursor-pointer"
                    >
                      Add to Bag
                    </button>
                  </div>
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

      {/* ── Mobile Persistent Bottom Action Bar ──────────────────────── */}
      <div className="md:hidden fixed bottom-3 inset-x-3.5 z-40">
        <div
          className={`backdrop-blur-2xl rounded-2xl p-2 border shadow-2xl flex items-center justify-around transition-all ${
            isWhite
              ? "bg-[#faf7f0]/95 border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.15)] text-black"
              : "bg-[#101014]/95 border-white/15 shadow-[0_15px_45px_rgba(0,0,0,0.9)] text-white"
          }`}
        >
          <Link
            href="/shop"
            className="py-1.5 px-3 rounded-xl bg-[#ff5500] text-white font-mono text-[10px] font-bold flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>SHOP</span>
          </Link>

          <Link
            href="/dashboard"
            className="py-1.5 px-3 rounded-xl opacity-60 hover:opacity-100 font-mono text-[10px] font-bold flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>VAULT</span>
          </Link>

          <button
            onClick={openCart}
            className="py-1.5 px-3 rounded-xl opacity-60 hover:opacity-100 font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>BAG</span>
          </button>

          <button
            onClick={() => setContactModalOpen(true)}
            className="py-1.5 px-3 rounded-xl opacity-60 hover:opacity-100 font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>HELP</span>
          </button>
        </div>
      </div>

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

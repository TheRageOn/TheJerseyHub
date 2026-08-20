"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import AuthModal from "@/components/auth/AuthModal";
import ContactModal from "@/components/contact/ContactModal";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { isWhite, toggleTheme } = useTheme();
  const { openCart } = useCart();

  const userRole = user?.role || "customer";
  const isAdmin = userRole === "admin";

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "vault" | "orders" | "drops" | "settings" | "admin_orders" | "admin_products" | "admin_analytics" | "admin_users"
  >(isAdmin ? "admin_orders" : "vault");

  // Admin view toggle (allows admin to preview collector vault)
  const [adminCollectorPreview, setAdminCollectorPreview] = useState(false);

  // Toggle Switches State (Collector)
  const [switches, setSwitches] = useState({
    authAlerts: true,
    restock: true,
    reserve: false,
    codPay: true,
  });

  // Admin Demo Order Statuses
  const [adminOrders, setAdminOrders] = useState([
    {
      id: "TJH-9842",
      customer: "Alex Mercer",
      email: "alex@example.com",
      item: "ARS CANNON HOME 22/23 (L)",
      total: "$92.00",
      status: "Processing",
      date: "18 Aug 2026",
    },
    {
      id: "TJH-9841",
      customer: "Elena Rostova",
      email: "elena@domain.com",
      item: "FCB 125TH ANNIVERSARY (M)",
      total: "$125.00",
      status: "Shipped",
      date: "18 Aug 2026",
    },
    {
      id: "TJH-9840",
      customer: "Liam Foster",
      email: "liam@example.com",
      item: "MAN UTD 98/99 TREBLE (XL)",
      total: "$165.00",
      status: "Pending",
      date: "17 Aug 2026",
    },
    {
      id: "TJH-9839",
      customer: "Marcus Vance",
      email: "marcus@vance.io",
      item: "RMA CHAMARTÍN WHITE (L)",
      total: "$130.00",
      status: "Delivered",
      date: "15 Aug 2026",
    },
  ]);

  // Admin New Product Form State
  const [newKit, setNewKit] = useState({
    name: "",
    club: "",
    season: "24/25 MATCH SPEC",
    price: "$130.00",
    stock: "25",
  });
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);

  // Edit Profile Form State
  const [profileName, setProfileName] = useState(user?.name || "Rajak");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+977 9800000000");
  const [profileSaved, setProfileSaved] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const displayName = user?.name ? user.name.toUpperCase() : "RAJAK";

  const handleToggle = (key: keyof typeof switches) => {
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: profileName, phone: profilePhone });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setAdminOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProductAddedSuccess(true);
    setNewKit({ name: "", club: "", season: "24/25 MATCH SPEC", price: "$130.00", stock: "25" });
    setTimeout(() => setProductAddedSuccess(false), 2500);
  };

  return (
    <main
      className={`min-h-screen w-full transition-colors duration-500 ${
        isWhite ? "theme-white bg-[#faf7f0] text-[#0c0c0c]" : "theme-black bg-[#060606] text-white"
      }`}
    >
      {/* Tactile Film Grain */}
      <div className="film-grain" style={{ opacity: isWhite ? 0.28 : 0.18 }} />

      {/* ── Top Status Bar ─────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 w-full h-10 backdrop-blur-md border-b px-4 sm:px-8 flex items-center justify-between font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase select-none transition-colors ${
          isWhite
            ? "bg-[#faf7f0]/95 border-black/10 text-black"
            : "bg-[#070707]/95 border-white/10 text-white"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="font-bold text-[#ff5500] hover:underline">
            [THEJERSEYHUB]
          </Link>
          <span className="opacity-30">•</span>
          {isAdmin ? (
            <span className="flex items-center gap-1.5 text-[#ff5500] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
              ROOT CONTROL // ADMIN COMMAND DECK
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              COLLECTOR VAULT // SESSION ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/shop" className="text-[#ff5500] font-bold hover:underline flex items-center gap-1">
            <span>SHOP MARKETPLACE</span>
            <span>→</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="hover:text-[#ff5500] transition-colors cursor-pointer"
          >
            THEME [{isWhite ? "CHALK" : "NOIR"}]
          </button>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-red-500 font-bold hover:underline cursor-pointer"
          >
            [LOGOUT]
          </button>
        </div>
      </header>

      {/* ── Main Dashboard Layout ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex gap-6 sm:gap-8 items-start">
        
        {/* Left Vertical Icon Dock */}
        <aside
          className={`w-14 sm:w-16 rounded-3xl p-3 sm:p-4 border flex flex-col items-center justify-between shrink-0 h-[700px] sticky top-14 z-30 self-start transition-all ${
            isWhite
              ? "bg-white/80 border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
              : "bg-[#101014] border-white/10 shadow-2xl"
          }`}
        >
          {/* User Initial Avatar Badge */}
          <div
            className={`w-9 h-9 rounded-2xl font-mono font-bold text-xs flex items-center justify-center shadow-md ${
              isAdmin
                ? "bg-[#ff5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.5)] ring-2 ring-[#ff5500]/30"
                : "bg-[#ff5500] text-white"
            }`}
          >
            {isAdmin ? "ADM" : displayName[0] || "R"}
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col gap-4 text-sm">
            {/* Shop Marketplace Trigger */}
            <Link
              href="/shop"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#ff5500]/10 text-[#ff5500] hover:bg-[#ff5500] hover:text-white transition-all cursor-pointer shadow-sm"
              title="Shop Marketplace"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </Link>

            <span className="w-4 h-[1px] bg-black/10 dark:bg-white/10 mx-auto" />

            {/* Collector Vault Home */}
            <button
              onClick={() => {
                setActiveTab("vault");
                setAdminCollectorPreview(false);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTab === "vault"
                  ? "bg-[#ff5500] text-white shadow-sm"
                  : "opacity-40 hover:opacity-100"
              }`}
              title="Collector Vault"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>

            {/* Orders History */}
            <button
              onClick={() => {
                setActiveTab("orders");
                setAdminCollectorPreview(false);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#ff5500] text-white shadow-sm"
                  : "opacity-40 hover:opacity-100"
              }`}
              title="Personal Orders"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>

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

            {/* Settings */}
            <button
              onClick={() => {
                setActiveTab("settings");
                setAdminCollectorPreview(false);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#ff5500] text-white shadow-sm"
                  : "opacity-40 hover:opacity-100"
              }`}
              title="Collector Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Admin Command Deck Icon */}
            {isAdmin && (
              <>
                <span className="w-4 h-[1px] bg-[#ff5500]/40 mx-auto" />
                <button
                  onClick={() => {
                    setActiveTab("admin_orders");
                    setAdminCollectorPreview(false);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer font-mono text-[10px] font-bold ${
                    activeTab.startsWith("admin") && !adminCollectorPreview
                      ? "bg-[#ff5500] text-white shadow-[0_0_15px_rgba(255,85,0,0.5)]"
                      : "bg-[#ff5500]/15 text-[#ff5500] hover:bg-[#ff5500]/30"
                  }`}
                  title="Admin Command Deck"
                >
                  ADM
                </button>
              </>
            )}
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

        {/* ── Main Content Area ──────────────────────────────────────── */}
        <div className="flex-1 space-y-8">
          
          {/* ========================================================= */}
          {/* ── ADMIN VIEW: SYSTEM COMMAND DECK ─────────────────────── */}
          {/* ========================================================= */}
          {isAdmin && !adminCollectorPreview ? (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Admin Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-black/10 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#ff5500] text-white font-mono text-[9px] font-bold tracking-widest uppercase">
                      SYSTEM ADMIN
                    </span>
                    <span className="text-[10px] font-mono opacity-50 uppercase">
                      ROOT PRIVILEGES ENGAGED
                    </span>
                  </div>
                  <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight">
                    Vault Command Deck // {displayName}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdminCollectorPreview(true)}
                    className="px-3.5 py-2 rounded-xl font-mono text-xs border border-[#ff5500]/40 text-[#ff5500] hover:bg-[#ff5500]/10 transition-colors cursor-pointer"
                  >
                    [PREVIEW COLLECTOR VAULT]
                  </button>
                  <Link
                    href="/shop"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_4px_15px_rgba(255,85,0,0.35)]"
                  >
                    View Live Store →
                  </Link>
                </div>
              </div>

              {/* 4-Card KPI Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "TOTAL REVENUE",
                    value: "$24,850.00",
                    change: "+14.2% vs last cycle",
                    positive: true,
                  },
                  {
                    title: "ACTIVE ORDERS",
                    value: "18 DISPATCHES",
                    change: "4 Pending Delivery",
                    positive: true,
                  },
                  {
                    title: "VAULT INVENTORY",
                    value: "42 EDITIONS",
                    change: "3 Low Stock",
                    positive: false,
                  },
                  {
                    title: "COLLECTORS",
                    value: "1,248 USERS",
                    change: "+38 Registered",
                    positive: true,
                  },
                ].map((kpi, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border font-mono transition-all ${
                      isWhite
                        ? "bg-white/80 border-black/10 shadow-sm"
                        : "bg-[#121216] border-white/10"
                    }`}
                  >
                    <span className="text-[10px] opacity-50 uppercase">{kpi.title}</span>
                    <p className="text-xl font-bold text-[#ff5500] mt-1">{kpi.value}</p>
                    <span className={`text-[10px] ${kpi.positive ? "text-emerald-500" : "text-amber-500"}`}>
                      {kpi.change}
                    </span>
                  </div>
                ))}
              </div>

              {/* Admin Navigation Pills */}
              <div className="flex flex-wrap gap-2 border-b pb-3 border-black/10 dark:border-white/10 font-mono text-xs">
                {[
                  { id: "admin_orders" as const, label: "ORDER FULFILLMENT" },
                  { id: "admin_products" as const, label: "INVENTORY & ADD KITS" },
                  { id: "admin_analytics" as const, label: "SALES ANALYTICS" },
                  { id: "admin_users" as const, label: "COLLECTOR DIRECTORY" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer border ${
                      activeTab === tab.id
                        ? "bg-[#ff5500] text-white border-[#ff5500] font-bold shadow-sm"
                        : isWhite
                        ? "bg-black/5 hover:bg-black/10 border-transparent text-black/75"
                        : "bg-white/5 hover:bg-white/10 border-transparent text-white/75"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Admin Tab 1: Order Fulfillment */}
              {activeTab === "admin_orders" && (
                <section
                  className={`p-6 rounded-3xl border space-y-4 ${
                    isWhite ? "bg-white border-black/10 shadow-sm" : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs border-b pb-3 border-black/10 dark:border-white/10">
                    <span className="font-bold tracking-wider">[LIVE CUSTOMER ORDERS DISPATCH]</span>
                    <span className="opacity-50">{adminOrders.length} ORDERS TOTAL</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b text-[10px] opacity-50 uppercase border-black/10 dark:border-white/10">
                          <th className="pb-3">ORDER ID</th>
                          <th className="pb-3">COLLECTOR</th>
                          <th className="pb-3">ITEM SPEC</th>
                          <th className="pb-3">TOTAL</th>
                          <th className="pb-3">DATE</th>
                          <th className="pb-3 text-right">CHANGE STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {adminOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                            <td className="py-3 font-bold text-[#ff5500]">{order.id}</td>
                            <td className="py-3">
                              <p className="font-bold">{order.customer}</p>
                              <p className="text-[10px] opacity-50">{order.email}</p>
                            </td>
                            <td className="py-3">{order.item}</td>
                            <td className="py-3 font-bold">{order.total}</td>
                            <td className="py-3 opacity-60 text-[10px]">{order.date}</td>
                            <td className="py-3 text-right">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className={`py-1 px-2 rounded-lg text-xs font-mono border outline-none cursor-pointer ${
                                  order.status === "Delivered"
                                    ? "text-emerald-500 border-emerald-500/30"
                                    : order.status === "Shipped"
                                    ? "text-blue-500 border-blue-500/30"
                                    : "text-[#ff5500] border-[#ff5500]/30"
                                } ${isWhite ? "bg-[#faf7f0]" : "bg-[#16161a]"}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Admin Tab 2: Inventory & Add Kits */}
              {activeTab === "admin_products" && (
                <section
                  className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                    isWhite ? "bg-white border-black/10 shadow-sm" : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="border-b pb-4 border-black/10 dark:border-white/10">
                    <h3 className="font-mono text-base font-bold">[VAULT REPOSITORY // ADD NEW KIT]</h3>
                    <p className="text-xs opacity-60 mt-0.5">
                      Register new match-issue specifications and drop allocations to the public marketplace.
                    </p>
                  </div>

                  {productAddedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs">
                      ✓ New jersey edition registered into database repository.
                    </div>
                  )}

                  <form onSubmit={handleAddProduct} className="space-y-4 max-w-xl font-mono text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">Kit Title</label>
                        <input
                          type="text"
                          required
                          value={newKit.name}
                          onChange={(e) => setNewKit({ ...newKit, name: e.target.value })}
                          placeholder="e.g. INTER MILAN 97/98 UEFA CUP"
                          className={`w-full h-10 px-3.5 rounded-xl border outline-none ${
                            isWhite ? "bg-[#faf7f0] border-black/10" : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">Club / Entity</label>
                        <input
                          type="text"
                          required
                          value={newKit.club}
                          onChange={(e) => setNewKit({ ...newKit, club: e.target.value })}
                          placeholder="e.g. FC INTERNAZIONALE"
                          className={`w-full h-10 px-3.5 rounded-xl border outline-none ${
                            isWhite ? "bg-[#faf7f0] border-black/10" : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">Price</label>
                        <input
                          type="text"
                          required
                          value={newKit.price}
                          onChange={(e) => setNewKit({ ...newKit, price: e.target.value })}
                          placeholder="$135.00"
                          className={`w-full h-10 px-3.5 rounded-xl border outline-none ${
                            isWhite ? "bg-[#faf7f0] border-black/10" : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase opacity-60 mb-1">Stock Units</label>
                        <input
                          type="number"
                          required
                          value={newKit.stock}
                          onChange={(e) => setNewKit({ ...newKit, stock: e.target.value })}
                          placeholder="25"
                          className={`w-full h-10 px-3.5 rounded-xl border outline-none ${
                            isWhite ? "bg-[#faf7f0] border-black/10" : "bg-[#16161a] border-white/10"
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#ff5500] text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
                    >
                      + Publish to Marketplace
                    </button>
                  </form>
                </section>
              )}

              {/* Admin Tab 3: Sales Analytics */}
              {activeTab === "admin_analytics" && (
                <section
                  className={`p-6 rounded-3xl border space-y-6 ${
                    isWhite ? "bg-white border-black/10 shadow-sm" : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10 font-mono text-xs">
                    <span className="font-bold">[PLATFORM PERFORMANCE & SALES REPORT]</span>
                    <span className="text-[#ff5500] font-bold">2026 FISCAL CYCLE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-1">
                      <span className="opacity-50 text-[10px]">TOP SELLER</span>
                      <p className="font-bold text-sm">FCB 125TH ANNIVERSARY</p>
                      <p className="text-[#ff5500]">84 Units Sold</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-1">
                      <span className="opacity-50 text-[10px]">AVG ORDER VALUE</span>
                      <p className="font-bold text-sm">$128.40</p>
                      <p className="text-emerald-500">+8.5% YoY</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-1">
                      <span className="opacity-50 text-[10px]">FULFILLMENT RATE</span>
                      <p className="font-bold text-sm">99.2% ON-TIME</p>
                      <p className="text-emerald-500">Kathmandu Hub</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Admin Tab 4: Collector Directory */}
              {activeTab === "admin_users" && (
                <section
                  className={`p-6 rounded-3xl border space-y-4 ${
                    isWhite ? "bg-white border-black/10 shadow-sm" : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10 font-mono text-xs">
                    <span className="font-bold">[VERIFIED COLLECTORS DIRECTORY]</span>
                    <span className="opacity-50">1,248 REGISTERED</span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    {[
                      { name: "Alex Mercer", email: "alex@example.com", tier: "Tier 04", orders: "8", status: "Active" },
                      { name: "Elena Rostova", email: "elena@domain.com", tier: "Tier 03", orders: "4", status: "Active" },
                      { name: "Marcus Vance", email: "marcus@vance.io", tier: "Tier 02", orders: "2", status: "Active" },
                    ].map((col, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border flex items-center justify-between border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div>
                          <p className="font-bold">{col.name}</p>
                          <p className="text-[10px] opacity-50">{col.email} • {col.tier}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-emerald-500 font-bold">{col.status}</span>
                          <button className="text-[10px] text-red-500 hover:underline cursor-pointer">
                            [BLOCK]
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Main Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-black/10 dark:border-white/10">
                <div>
                  <h1 className="font-mono text-xl sm:text-2xl font-bold tracking-[0.14em]">
                    VAULT // {displayName} [PRO - TIER 03]
                  </h1>
                  <p className="text-[11px] font-mono opacity-50 mt-0.5">
                    VERIFIED ARCHIVE COLLECTOR ID: TJH-COL-8902 // ALLOCATED TO NEPAL REGION
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs opacity-50">AUG 20, 2026</span>
                  <Link
                    href="/shop"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff5500] to-[#e64000] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_4px_15px_rgba(255,85,0,0.35)]"
                  >
                    + Acquire Kits
                  </Link>
                </div>
              </div>

              {/* ── Top 3-Column Intelligence Grid (Reference 3) ──────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Notification & Delivery Toggles + In-Transit Card */}
                <div className="space-y-4">
                  {/* 2x2 Switch Matrix */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isWhite ? "bg-white/80 border-black/10" : "bg-[#121216] border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] text-[#ff5500] font-bold uppercase">
                          {switches.authAlerts ? "ON" : "OFF"}
                        </span>
                        <button
                          onClick={() => handleToggle("authAlerts")}
                          className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                            switches.authAlerts ? "bg-[#ff5500]" : "bg-black/20 dark:bg-white/20"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white transition-transform ${
                              switches.authAlerts ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="font-mono text-[10px] font-bold">AUTH ALERTS</p>
                      <p className="font-mono text-[8.5px] opacity-50 uppercase">MATCH VERIFY</p>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isWhite ? "bg-white/80 border-black/10" : "bg-[#121216] border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] text-[#ff5500] font-bold uppercase">
                          {switches.restock ? "ON" : "OFF"}
                        </span>
                        <button
                          onClick={() => handleToggle("restock")}
                          className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                            switches.restock ? "bg-[#ff5500]" : "bg-black/20 dark:bg-white/20"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white transition-transform ${
                              switches.restock ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="font-mono text-[10px] font-bold">RESTOCK</p>
                      <p className="font-mono text-[8.5px] opacity-50 uppercase">WISHLIST</p>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isWhite ? "bg-white/80 border-black/10" : "bg-[#121216] border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] text-[#ff5500] font-bold uppercase">
                          {switches.reserve ? "ON" : "OFF"}
                        </span>
                        <button
                          onClick={() => handleToggle("reserve")}
                          className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                            switches.reserve ? "bg-[#ff5500]" : "bg-black/20 dark:bg-white/20"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white transition-transform ${
                              switches.reserve ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="font-mono text-[10px] font-bold">RESERVE</p>
                      <p className="font-mono text-[8.5px] opacity-50 uppercase">LIVE DROPS</p>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isWhite ? "bg-white/80 border-black/10" : "bg-[#121216] border-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[9px] text-[#ff5500] font-bold uppercase">
                          {switches.codPay ? "ON" : "OFF"}
                        </span>
                        <button
                          onClick={() => handleToggle("codPay")}
                          className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                            switches.codPay ? "bg-[#ff5500]" : "bg-black/20 dark:bg-white/20"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white transition-transform ${
                              switches.codPay ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="font-mono text-[10px] font-bold">COD PAY</p>
                      <p className="font-mono text-[8.5px] opacity-50 uppercase">DELIVERY</p>
                    </div>
                  </div>

                  {/* In-Transit Active Order Card */}
                  <div
                    className={`p-4 rounded-2xl border font-mono text-xs transition-all ${
                      isWhite
                        ? "bg-white/90 border-[#ff5500]/30 shadow-sm"
                        : "bg-[#121216] border-[#ff5500]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[#ff5500] font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
                        IN TRANSIT
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[#ff5500]/10 text-[#ff5500] font-bold">
                        [TRACK]
                      </span>
                    </div>
                    <p className="font-bold text-xs">ORDER #TJH-9842</p>
                    <p className="text-[10px] opacity-60 mt-0.5">1x ARS CANNON // 22 AUG</p>
                  </div>
                </div>

                {/* Column 2: Collector Tier Progress + Next Scheduled Drop */}
                <div className="space-y-4">
                  {/* Radial Collector Tier Progress */}
                  <div
                    className={`p-6 rounded-3xl border text-center transition-all ${
                      isWhite ? "bg-white/80 border-black/10" : "bg-[#121216] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-3">
                      <span className="opacity-60">[COLLECTOR TIER]</span>
                      <span className="text-[#ff5500] font-bold">• PRO LEVEL 03</span>
                    </div>

                    {/* Progress Wheel */}
                    <div className="relative w-28 h-28 mx-auto my-2 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-black/10 dark:text-white/10"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#ff5500"
                          strokeWidth="8"
                          strokeDasharray="251.2"
                          strokeDashoffset="30"
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-xl font-bold">88%</span>
                        <span className="font-mono text-[8px] opacity-50 uppercase">TO TIER 04</span>
                      </div>
                    </div>

                    <p className="font-mono text-[9px] opacity-50 mt-3">
                      180 PTS UNLOCKS 98/99 TREBLE RETRO DROP ACCESS
                    </p>
                  </div>

                  {/* Next Scheduled Drop Card */}
                  <div
                    className={`p-4 rounded-2xl border font-mono text-xs transition-all ${
                      isWhite ? "bg-white/80 border-black/10" : "bg-[#121216] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="opacity-60">[NEXT SCHEDULED DROP]</span>
                      <span className="text-[#ff5500] font-bold">• 26 AUG</span>
                    </div>
                    <p className="font-bold text-xs">MAN UTD 98/99 TREBLE</p>
                    <p className="text-[10px] opacity-50">ALLOCATION : 25 UNITS // UMBRO SHARP</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[9.5px]">
                      <span className="text-emerald-500 font-bold">DROP ALERT [ACTIVE]</span>
                      <button className="text-[#ff5500] font-bold hover:underline cursor-pointer">
                        [+ RESERVE SLOT]
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3: Featured Spec 3D Showcase */}
                <div
                  className={`p-6 rounded-3xl border flex flex-col justify-between relative transition-all ${
                    isWhite
                      ? "bg-white/80 border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
                      : "bg-[#121216] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="opacity-60">FEATURED SPEC: FC BARCELONA</span>
                    <span className="font-bold text-[#ff5500]">$125.00</span>
                  </div>

                  <div className="relative w-full h-44 my-3 flex items-center justify-center">
                    <Image
                      src="/images/barca-jersey.svg"
                      alt="Barcelona 125th Anniversary"
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5 font-mono text-xs">
                    <div>
                      <p className="font-bold text-xs truncate">FC BARCELONA 125TH ANNIVERSARY</p>
                      <p className="text-[9.5px] opacity-50">24/25 HOME MATCH SPEC // [01/FCB]</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-emerald-500 text-[10px] font-bold">[VERIFIED]</span>
                      <Link
                        href="/shop"
                        className="px-3 py-1 rounded-lg bg-[#ff5500] text-white text-[10px] font-bold uppercase tracking-wider"
                      >
                        [INSPECT]
                      </Link>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Section 1: VAULT COLLECTION // ALL KITS ── */}
              <section className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs border-b pb-2 border-black/10 dark:border-white/10">
                  <span className="font-bold tracking-wider">[VAULT COLLECTION // ALL KITS]</span>
                  <span className="opacity-50">4 ENTRIES RECORDED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      club: "FC BARCELONA",
                      spec: "24/25 HOME MATCH SPEC // [01/FCB]",
                      price: "$125.00",
                      status: "[OWNED]",
                      isOwned: true,
                      image: "/images/barca-jersey.svg",
                    },
                    {
                      club: "REAL MADRID CF",
                      spec: "24/25 HOME MATCH SPEC // [02/RMA]",
                      price: "$130.00",
                      status: "[WISH]",
                      isOwned: false,
                      image: "/images/real-jersey.svg",
                    },
                    {
                      club: "ARSENAL FC",
                      spec: "24/25 THIRD SPEC // [03/ARS]",
                      price: "$120.00",
                      status: "[OWNED]",
                      isOwned: true,
                      image: "/images/arsenal-jersey.svg",
                    },
                    {
                      club: "MANCHESTER UNITED",
                      spec: "24/25 HOME MATCH SPEC // [04/MUFC]",
                      price: "$125.00",
                      status: "[WISH]",
                      isOwned: false,
                      image: "/images/manchester-united-jersey.svg",
                    },
                  ].map((kit, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border font-mono text-xs flex flex-col justify-between relative transition-all ${
                        kit.isOwned
                          ? isWhite
                            ? "bg-white border-[#ff5500]/40 shadow-sm"
                            : "bg-[#14141a] border-[#ff5500]/40"
                          : isWhite
                          ? "bg-white/60 border-black/10"
                          : "bg-[#0e0e12] border-white/10"
                      }`}
                    >
                      <div className="relative w-full h-32 my-1 flex items-center justify-center">
                        <Image
                          src={kit.image}
                          alt={kit.club}
                          fill
                          className="object-contain drop-shadow-md"
                        />
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="font-bold text-xs truncate">{kit.club}</p>
                        <p className="text-[9px] opacity-50 truncate">{kit.spec}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                          <span className="text-[#ff5500] font-bold">{kit.price}</span>
                          <span
                            className={`text-[9.5px] font-bold ${
                              kit.isOwned ? "text-[#ff5500]" : "opacity-40"
                            }`}
                          >
                            {kit.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Section 2: ORDER HISTORY // ARCHIVE TABLE ── */}
              <section className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs border-b pb-2 border-black/10 dark:border-white/10">
                  <span className="font-bold tracking-wider">[ORDER HISTORY // ARCHIVE]</span>
                  <button className="text-[#ff5500] hover:underline cursor-pointer">
                    [VIEW ALL]
                  </button>
                </div>

                <div
                  className={`rounded-2xl border overflow-hidden font-mono text-xs ${
                    isWhite ? "bg-white/80 border-black/10" : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr
                          className={`border-b text-[10px] opacity-50 uppercase ${
                            isWhite ? "border-black/10 bg-black/5" : "border-white/10 bg-white/5"
                          }`}
                        >
                          <th className="p-3.5">ORDER REF</th>
                          <th className="p-3.5">KIT SPECIFICATION</th>
                          <th className="p-3.5">TIMESTAMP</th>
                          <th className="p-3.5">PRICE</th>
                          <th className="p-3.5 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {[
                          {
                            ref: "#TJH-9842",
                            spec: "ARS CANNON HOME 22/23",
                            time: "18 AUG 2026",
                            price: "$92.00",
                            status: "[IN TRANSIT]",
                            statusColor: "text-[#ff5500]",
                          },
                          {
                            ref: "#TJH-9801",
                            spec: "FCB 125TH ANNIVERSARY",
                            time: "10 AUG 2026",
                            price: "$125.00",
                            status: "[DELIVERED]",
                            statusColor: "text-emerald-500",
                          },
                          {
                            ref: "#TJH-9755",
                            spec: "RMA HOME 23/24",
                            time: "28 JUL 2026",
                            price: "$110.00",
                            status: "[DELIVERED]",
                            statusColor: "text-emerald-500",
                          },
                        ].map((row, i) => (
                          <tr
                            key={i}
                            className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="p-3.5 font-bold text-[#ff5500]">{row.ref}</td>
                            <td className="p-3.5">{row.spec}</td>
                            <td className="p-3.5 opacity-60">{row.time}</td>
                            <td className="p-3.5 font-bold">{row.price}</td>
                            <td className={`p-3.5 text-right font-bold ${row.statusColor}`}>
                              {row.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* ── Section 3: Profile Settings & Address Form ─────────────── */}
              {activeTab === "settings" && (
                <section
                  className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                    isWhite ? "bg-white border-black/10 shadow-sm" : "bg-[#101014] border-white/10"
                  }`}
                >
                  <div className="border-b pb-4 border-black/10 dark:border-white/10">
                    <h3 className="font-mono text-base font-bold">[COLLECTOR IDENTITY & SHIPPING]</h3>
                    <p className="text-xs opacity-60 mt-0.5">
                      Update your match verification details and default dispatch address.
                    </p>
                  </div>

                  {profileSaved && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-mono text-xs">
                      ✓ Profile credentials updated successfully.
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl font-mono text-xs">
                    <div>
                      <label className="block text-[10px] uppercase opacity-60 mb-1">
                        Collector Full Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                          isWhite ? "bg-[#faf7f0] border-black/10" : "bg-[#16161a] border-white/10"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase opacity-60 mb-1">
                        Dispatch Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className={`w-full h-11 px-3.5 rounded-xl border outline-none ${
                          isWhite ? "bg-[#faf7f0] border-black/10" : "bg-[#16161a] border-white/10"
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#ff5500] text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
                    >
                      Save Identity Specs
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Footer */}
      <footer
        className={`w-full border-t py-6 px-6 sm:px-12 flex items-center justify-between font-mono text-[10px] opacity-60 ${
          isWhite ? "border-black/10 bg-[#f4efe5]" : "border-white/10 bg-[#070709]"
        }`}
      >
        <span>© 2026 [THEJERSEYHUB] COLLECTOR VAULT ENGINE</span>
        <button
          onClick={() => setContactModalOpen(true)}
          className="hover:text-[#ff5500] cursor-pointer"
        >
          [CONTACT DESK]
        </button>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode="login"
        theme={isWhite ? "white" : "black"}
        onClose={() => setAuthModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        theme={isWhite ? "white" : "black"}
        onClose={() => setContactModalOpen(false)}
      />
    </main>
  );
}

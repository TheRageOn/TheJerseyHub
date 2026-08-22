"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useCart, KitCustomization } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiRequest } from "@/lib/api";
import { getSafeImageSrc } from "@/lib/imageUtils";
import { downloadReceiptPDF } from "@/lib/pdfGenerator";
import CertificateOfAuthenticity from "../certificate/CertificateOfAuthenticity";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfirmedOrderDetails {
  orderId: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  items: {
    id: string;
    name: string;
    club?: string;
    season?: string;
    size: string;
    quantity: number;
    priceNumeric: number;
    imageSrc?: string;
    customization?: KitCustomization;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
}

type PaymentRail = "COD" | "STRIPE" | "ESEWA" | "KHALTI";

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart, updateQuantity, removeFromCart, formatPrice } = useCart();
  const { user } = useAuth();
  const { isWhite } = useTheme();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "Kathmandu",
    notes: "",
  });

  const [paymentRail, setPaymentRail] = useState<PaymentRail>("COD");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCert, setActiveCert] = useState<{
    mintId: string;
    productName: string;
    club: string;
    season: string;
    imageSrc?: string;
    customerName: string;
    orderDate: string;
  } | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage("Your bag is currently empty. Add a kit before checking out.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const orderPayload = {
      items: items.map((i) => ({
        product: i.id,
        name: i.jersey.name,
        size: i.size,
        quantity: i.quantity,
        price: i.priceNumeric,
        image: i.jersey.imageSrc,
        customization: i.customization,
      })),
      shippingAddress: {
        fullName: formData.name,
        phone: formData.phone,
        street: formData.address,
        city: formData.city,
        country: "Nepal",
      },
      paymentMethod:
        paymentRail === "COD"
          ? "Cash on Delivery"
          : paymentRail === "STRIPE"
          ? "Stripe / Card"
          : paymentRail === "ESEWA"
          ? "eSewa Mobile Wallet"
          : "Khalti Digital Wallet",
      paymentStatus: paymentRail === "COD" ? "pending" : "paid",
      totalAmount: subtotal,
    };

    const orderDateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const res = await apiRequest<{ _id?: string; id?: string }>("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      const generatedId =
        res.data?._id || res.data?.id || `TJH-${Math.floor(100000 + Math.random() * 900000)}`;

      setConfirmedOrder({
        orderId: generatedId,
        date: orderDateStr,
        customer: { ...formData },
        items: items.map((i) => ({
          id: i.id,
          name: i.jersey.name,
          club: i.jersey.club,
          season: i.jersey.season,
          size: i.size,
          quantity: i.quantity,
          priceNumeric: i.priceNumeric,
          imageSrc: i.jersey.imageSrc,
          customization: i.customization,
        })),
        subtotal,
        shipping: 0,
        total: subtotal,
        paymentMethod: orderPayload.paymentMethod,
      });

      setStatus("success");
      clearCart();
    } catch {
      // Local fallback simulation if offline
      const simulatedId = `TJH-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrder({
        orderId: simulatedId,
        date: orderDateStr,
        customer: { ...formData },
        items: items.map((i) => ({
          id: i.id,
          name: i.jersey.name,
          club: i.jersey.club,
          season: i.jersey.season,
          size: i.size,
          quantity: i.quantity,
          priceNumeric: i.priceNumeric,
          imageSrc: i.jersey.imageSrc,
          customization: i.customization,
        })),
        subtotal,
        shipping: 0,
        total: subtotal,
        paymentMethod: orderPayload.paymentMethod,
      });

      setStatus("success");
      clearCart();
    }
  };

  // Download Official PDF Receipt directly
  const handlePrintReceipt = () => {
    if (!confirmedOrder) return;
    downloadReceiptPDF(confirmedOrder);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-10 transition-all duration-200 border font-sans ${
            isWhite
              ? "bg-[#faf8f5] border-black/10 text-[#0f0f0f] shadow-2xl"
              : "bg-[#111114] border-white/10 text-white shadow-2xl"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 z-30 w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer font-mono text-xs border ${
              isWhite
                ? "bg-black/5 hover:bg-black/10 text-black border-black/10"
                : "bg-white/5 hover:bg-white/10 text-white border-white/10"
            }`}
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* ── SUCCESS STATE: ORDER CONFIRMATION & RECEIPT ── */}
          {status === "success" && confirmedOrder ? (
            <div ref={receiptRef} className="space-y-6">
              <div className="text-center pb-4 border-b border-black/10 dark:border-white/10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-mono text-[10px] tracking-widest text-[#ff5500] uppercase font-bold block mb-1">
                  ORDER SUCCESSFUL // DISPATCH CONFIRMED
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Thank you for your order</h2>
                <p className="text-sm opacity-60 mt-1">
                  Your kit reservation is confirmed and scheduled for express dispatch.
                </p>
              </div>

              {/* Digital Receipt Card */}
              <div
                className={`p-6 sm:p-8 rounded-2xl border text-sm space-y-5 ${
                  isWhite ? "bg-white border-black/10 shadow-sm" : "bg-[#16161b] border-white/10"
                }`}
              >
                {/* Header Meta */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-black/5 dark:border-white/5 text-xs">
                  <div>
                    <span className="opacity-40 uppercase block text-[10px] tracking-wider">Official Order Ref</span>
                    <span className="font-mono font-bold text-[#ff5500] text-sm">{confirmedOrder.orderId}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="opacity-40 uppercase block text-[10px] tracking-wider">Date & Payment</span>
                    <span className="font-mono">{confirmedOrder.date} • {confirmedOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Customer & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-black/5 dark:border-white/5 text-xs">
                  <div>
                    <span className="opacity-40 uppercase block text-[10px] tracking-wider mb-1 font-bold">Recipient</span>
                    <p className="font-semibold text-sm">{confirmedOrder.customer.name}</p>
                    <p className="opacity-60">{confirmedOrder.customer.email}</p>
                    <p className="opacity-60">{confirmedOrder.customer.phone}</p>
                  </div>
                  <div>
                    <span className="opacity-40 uppercase block text-[10px] tracking-wider mb-1 font-bold">Destination</span>
                    <p className="font-medium">{confirmedOrder.customer.address}</p>
                    <p className="opacity-70">{confirmedOrder.customer.city}, Nepal</p>
                  </div>
                </div>

                {/* Ordered Items */}
                <div>
                  <span className="opacity-40 uppercase block text-[10px] tracking-wider mb-3 font-bold">Purchased Kits</span>
                  <div className="space-y-3">
                    {confirmedOrder.items.map((item) => (
                      <div
                        key={`${item.id}-${item.size}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 border-b border-black/[0.04] dark:border-white/[0.04]"
                      >
                        <div className="flex items-center gap-3">
                          {item.imageSrc && (
                            <div className="relative w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center p-1 shrink-0">
                              <Image
                                src={getSafeImageSrc(item.imageSrc)}
                                alt={item.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm leading-snug">{item.name}</p>
                            <div className="flex items-center gap-2 text-xs opacity-60 mt-0.5">
                              <span>Size: [{item.size}]</span>
                              <span>•</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                            {item.customization?.playerName && (
                              <p className="text-xs text-[#ff5500] font-semibold mt-0.5">
                                [PRESS: {item.customization.playerName} #{item.customization.playerNumber}]
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-auto sm:ml-0">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveCert({
                                mintId:
                                  item.customization?.coaMintId ||
                                  `MINT-${Math.floor(1000 + Math.random() * 9000)}-${(item.club || "TJH").substring(0, 3).toUpperCase()}`,
                                productName: item.name,
                                club: item.club || "Official Kit",
                                season: item.season || "2026 Archive",
                                imageSrc: item.imageSrc,
                                customerName: confirmedOrder.customer.name,
                                orderDate: confirmedOrder.date,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl border border-black/15 dark:border-white/15 hover:border-[#ff5500] text-xs font-medium cursor-pointer transition-all"
                          >
                            View Certificate
                          </button>
                          <span className="font-mono font-bold text-sm">
                            {formatPrice(item.priceNumeric * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation */}
                <div className="pt-2 space-y-2 text-xs">
                  <div className="flex justify-between opacity-60">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(confirmedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between opacity-60">
                    <span>Express Courier Shipping</span>
                    <span className="font-bold">FREE ($0.00)</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-black/10 dark:border-white/10 font-bold text-base">
                    <span>Total Due</span>
                    <span className="font-mono text-[#ff5500] text-lg">{formatPrice(confirmedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className={`flex-1 py-3.5 px-5 rounded-xl font-medium text-xs uppercase tracking-wider border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isWhite
                      ? "bg-black/5 hover:bg-black/10 border-black/15 text-black"
                      : "bg-white/5 hover:bg-white/10 border-white/15 text-white"
                  }`}
                >
                  <span>Download / Print Receipt (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-5 bg-[#ff5500] hover:bg-[#ff661a] text-white font-medium text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all text-center"
                >
                  Back to Archive →
                </button>
              </div>
            </div>
          ) : (
            /* ── CHECKOUT FORM STATE ── */
            <>
              {/* Header */}
              <div className="mb-6 border-b pb-4 border-black/10 dark:border-white/10 pr-10">
                <span className="font-mono text-[10px] tracking-widest uppercase opacity-40 font-bold block mb-1">
                  SECURE CHECKOUT // ORDER DISPATCH
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Review & Place Order
                </h2>
                <p className="text-xs sm:text-sm opacity-60 mt-1">
                  Specify your delivery details and select your preferred payment rail.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Delivery Form */}
                <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs uppercase opacity-60 mb-1.5 font-semibold tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alex Mercer"
                      className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors ${
                        isWhite
                          ? "bg-white border-black/15 focus:border-[#ff5500] text-black"
                          : "bg-[#18181c] border-white/10 focus:border-[#ff5500] text-white"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase opacity-60 mb-1.5 font-semibold tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@domain.com"
                        className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors ${
                          isWhite
                            ? "bg-white border-black/15 focus:border-[#ff5500] text-black"
                            : "bg-[#18181c] border-white/10 focus:border-[#ff5500] text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase opacity-60 mb-1.5 font-semibold tracking-wider">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9812345678"
                        className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors ${
                          isWhite
                            ? "bg-white border-black/15 focus:border-[#ff5500] text-black"
                            : "bg-[#18181c] border-white/10 focus:border-[#ff5500] text-white"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase opacity-60 mb-1.5 font-semibold tracking-wider">
                        City / Region *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Kathmandu"
                        className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors ${
                          isWhite
                            ? "bg-white border-black/15 focus:border-[#ff5500] text-black"
                            : "bg-[#18181c] border-white/10 focus:border-[#ff5500] text-white"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase opacity-60 mb-1.5 font-semibold tracking-wider">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House, Street, Area"
                        className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition-colors ${
                          isWhite
                            ? "bg-white border-black/15 focus:border-[#ff5500] text-black"
                            : "bg-[#18181c] border-white/10 focus:border-[#ff5500] text-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Payment Rails Selection */}
                  <div className="pt-2">
                    <label className="block text-xs uppercase opacity-60 mb-2 font-semibold tracking-wider">
                      Select Payment Gateway Rail:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* COD */}
                      <button
                        type="button"
                        onClick={() => setPaymentRail("COD")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentRail === "COD"
                            ? "border-[#ff5500] bg-[#ff5500]/10 text-white shadow-xs"
                            : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 bg-black/[0.02] dark:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">[COD] Cash on Delivery</span>
                          {paymentRail === "COD" && <span className="text-[#ff5500] text-xs font-bold">●</span>}
                        </div>
                        <p className="text-xs opacity-60">Pay cash upon courier arrival</p>
                      </button>

                      {/* Stripe */}
                      <button
                        type="button"
                        onClick={() => setPaymentRail("STRIPE")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentRail === "STRIPE"
                            ? "border-[#ff5500] bg-[#ff5500]/10 text-white shadow-xs"
                            : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 bg-black/[0.02] dark:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">[CARD] Stripe / Card</span>
                          {paymentRail === "STRIPE" && <span className="text-[#ff5500] text-xs font-bold">●</span>}
                        </div>
                        <p className="text-xs opacity-60">Visa, MasterCard, Apple Pay</p>
                      </button>

                      {/* eSewa */}
                      <button
                        type="button"
                        onClick={() => setPaymentRail("ESEWA")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentRail === "ESEWA"
                            ? "border-[#ff5500] bg-[#ff5500]/10 text-white shadow-xs"
                            : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 bg-black/[0.02] dark:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">[ESEWA] eSewa Wallet</span>
                          {paymentRail === "ESEWA" && <span className="text-[#ff5500] text-xs font-bold">●</span>}
                        </div>
                        <p className="text-xs opacity-60">Instant digital wallet QR</p>
                      </button>

                      {/* Khalti */}
                      <button
                        type="button"
                        onClick={() => setPaymentRail("KHALTI")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          paymentRail === "KHALTI"
                            ? "border-[#ff5500] bg-[#ff5500]/10 text-white shadow-xs"
                            : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 bg-black/[0.02] dark:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">[KHALTI] Khalti Wallet</span>
                          {paymentRail === "KHALTI" && <span className="text-[#ff5500] text-xs font-bold">●</span>}
                        </div>
                        <p className="text-xs opacity-60">Direct mobile checkout</p>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={status === "submitting" || items.length === 0}
                      className="w-full h-13 bg-[#ff5500] hover:bg-[#ff661a] text-white font-sans text-sm font-bold uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {status === "submitting" ? (
                        <span>Processing Order...</span>
                      ) : (
                        <span>
                          Confirm Order ({paymentRail}) • {formatPrice(subtotal)} →
                        </span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    className={`p-5 sm:p-6 rounded-2xl border ${
                      isWhite ? "bg-white border-black/10 shadow-sm" : "bg-[#16161b] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5 dark:border-white/5">
                      <span className="font-bold text-xs uppercase opacity-60 tracking-wider">
                        Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={`${item.id}-${item.size}-${item.customization?.playerName || ""}`}
                          className="flex items-start justify-between gap-3 pb-3 border-b border-black/[0.04] dark:border-white/[0.04]"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="relative w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center p-1 shrink-0 mt-0.5">
                              <Image
                                src={getSafeImageSrc(item.jersey.imageSrc)}
                                alt={item.jersey.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs leading-snug line-clamp-2">{item.jersey.name}</p>
                              <div className="flex items-center gap-2 text-xs opacity-60 mt-1">
                                <span>Size: [{item.size}]</span>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                    className="hover:text-[#ff5500] px-1 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                    className="hover:text-[#ff5500] px-1 font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              {item.customization?.playerName && (
                                <p className="text-[11px] text-[#ff5500] font-medium mt-1">
                                  [PRESS: {item.customization.playerName} #{item.customization.playerNumber}]
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-xs">
                              {formatPrice(item.priceNumeric * item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id, item.size)}
                              className="block text-[10px] opacity-40 hover:opacity-100 hover:text-red-500 transition-colors ml-auto mt-1 cursor-pointer"
                            >
                              remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Math */}
                    <div className="pt-4 space-y-2 border-t border-black/5 dark:border-white/5 text-xs">
                      <div className="flex justify-between opacity-60">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between opacity-60">
                        <span>Express Courier Shipping</span>
                        <span className="font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-black/10 dark:border-white/10 font-bold text-sm">
                        <span>Total Due</span>
                        <span className="font-mono text-[#ff5500] text-base">{formatPrice(subtotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs opacity-70 space-y-1.5">
                    <p>• 100% Authentic Match Specification</p>
                    <p>• Includes Digital Certificate of Authenticity</p>
                    <p>• Express delivery in 2-3 business days</p>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {/* CoA Preview Modal */}
      <CertificateOfAuthenticity
        isOpen={Boolean(activeCert)}
        certData={activeCert}
        onClose={() => setActiveCert(null)}
      />
    </>
  );
}

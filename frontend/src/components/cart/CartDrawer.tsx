"use client";

import React from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import CheckoutModal from "../checkout/CheckoutModal";
import { getSafeImageSrc } from "@/lib/imageUtils";

export default function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    isCheckoutOpen,
    closeCart,
    openCheckout,
    closeCheckout,
    updateQuantity,
    removeFromCart,
    formatPrice,
  } = useCart();
  const { isWhite } = useTheme();

  return (
    <>
      {/* Slide-Over Drawer Container */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeCart}
          />

          <aside
            className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 shadow-2xl animate-in slide-in-from-right duration-300 ${
              isWhite
                ? "bg-[#faf7f0]/95 border-l border-black/10 text-[#0c0c0c]"
                : "bg-[#0d0d10]/95 border-l border-white/12 text-white"
            }`}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#ff5500]" />
                <h2 className="font-bold uppercase tracking-wider text-[#ff5500]">
                  BAG // [{totalItems} ITEMS]
                </h2>
              </div>

              <button
                onClick={closeCart}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer text-sm ${
                  isWhite ? "hover:bg-black/5 text-black/50" : "hover:bg-white/10 text-white/50"
                }`}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50 space-y-2">
                  <svg className="w-12 h-12 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="font-mono text-xs uppercase tracking-wider">Your bag is currently empty</p>
                </div>
              ) : (
                items.map((item) => {
                  const customKey = item.customization
                    ? `${item.customization.playerName || ""}-${item.customization.playerNumber || ""}-${(item.customization.patches || []).join(",")}`
                    : undefined;

                  return (
                    <div
                      key={`${item.id}-${item.size}-${customKey || ""}`}
                      className={`p-4 rounded-2xl border flex gap-4 items-center transition-all ${
                        isWhite
                          ? "bg-white/80 border-black/10 shadow-sm"
                          : "bg-[#141418] border-white/10"
                      }`}
                    >
                      <div className="relative w-16 h-16 shrink-0 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                        <Image
                          src={getSafeImageSrc(item.jersey.imageSrc)}
                          alt={item.jersey.name}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 font-mono text-xs">
                        <h4 className="font-bold text-xs truncate leading-snug">
                          {item.jersey.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] opacity-60">
                          <span>SIZE: [{item.size}]</span>
                          <span>•</span>
                          <span className="text-[#ff5500] font-semibold">
                            {formatPrice(item.priceNumeric)}
                          </span>
                        </div>

                        {item.customization?.playerName && (
                          <div className="text-[9.5px] text-[#ff5500] font-bold mt-1 truncate">
                            [PRESS: {item.customization.playerName} #{item.customization.playerNumber}]
                          </div>
                        )}

                        {/* Quantity Controller */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.quantity - 1, customKey)
                            }
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono border transition-colors cursor-pointer ${
                              isWhite
                                ? "border-black/10 hover:bg-black/5"
                                : "border-white/10 hover:bg-white/10"
                            }`}
                          >
                            -
                          </button>
                          <span className="font-mono text-xs px-1">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.quantity + 1, customKey)
                            }
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono border transition-colors cursor-pointer ${
                              isWhite
                                ? "border-black/10 hover:bg-black/5"
                                : "border-white/10 hover:bg-white/10"
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id, item.size, customKey)}
                        className="opacity-40 hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && (
              <div
                className={`p-6 border-t ${
                  isWhite ? "border-black/10 bg-[#f4efe5]/60" : "border-white/10 bg-[#09090b]/60"
                }`}
              >
                <div className="flex justify-between items-center mb-4 font-mono text-xs">
                  <span className="opacity-60">SUBTOTAL</span>
                  <span className="text-base font-bold text-[#ff5500]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <button
                  onClick={openCheckout}
                  className="w-full h-12 bg-[#ff5500] hover:bg-[#ff661a] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>Instant Checkout</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Global Checkout Modal - Active anywhere in app */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
      />
    </>
  );
}

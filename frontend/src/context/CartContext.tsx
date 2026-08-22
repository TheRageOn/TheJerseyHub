"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Jersey } from "@/data/jerseys";
import { useAuth } from "./AuthContext";
import { apiRequest } from "@/lib/api";

export interface KitCustomization {
  playerName?: string;
  playerNumber?: string;
  patches?: string[];
  extraCost?: number;
  coaMintId?: string;
}

export interface CartItem {
  id: string; // product id
  jersey: Jersey;
  size: "S" | "M" | "L" | "XL" | "XXL";
  quantity: number;
  priceNumeric: number;
  customization?: KitCustomization;
}

interface StoredCart {
  items: CartItem[];
  expiresAt: number; // timestamp
}

const GUEST_CART_EXPIRATION_DAYS = 7;

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  currency: "USD" | "NPR" | "EUR";
  setCurrency: (c: "USD" | "NPR" | "EUR") => void;
  formatPrice: (usdAmount: number) => string;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (
    jersey: Jersey,
    size?: "S" | "M" | "L" | "XL" | "XXL",
    quantity?: number,
    customization?: KitCustomization
  ) => void;
  instantBuy: (
    jersey: Jersey,
    size?: "S" | "M" | "L" | "XL" | "XXL",
    quantity?: number,
    customization?: KitCustomization
  ) => void;
  updateQuantity: (id: string, size: string, quantity: number, customKey?: string) => void;
  removeFromCart: (id: string, size: string, customKey?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function parsePrice(priceStr: string): number {
  const numeric = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  return isNaN(numeric) ? 120 : numeric;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currency, setCurrency] = useState<"USD" | "NPR" | "EUR">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tjh_currency");
      if (saved === "USD" || saved === "NPR" || saved === "EUR") return saved;
    }
    return "NPR";
  });
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("tjh_guest_cart");
        if (raw) {
          const parsed: StoredCart = JSON.parse(raw);
          if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
            return parsed.items || [];
          } else {
            localStorage.removeItem("tjh_guest_cart");
          }
        }
      } catch {}
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSetCurrency = useCallback((c: "USD" | "NPR" | "EUR") => {
    setCurrency(c);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tjh_currency", c);
      } catch {}
    }
  }, []);

  // Currency Formatter
  const formatPrice = useCallback(
    (usdAmount: number): string => {
      if (currency === "NPR") {
        const nprVal = Math.round(usdAmount * 135);
        return `Rs. ${nprVal.toLocaleString()}`;
      }
      if (currency === "EUR") {
        const eurVal = (usdAmount * 0.92).toFixed(2);
        return `€${eurVal}`;
      }
      return `$${usdAmount.toFixed(2)}`;
    },
    [currency]
  );

  // Save guest cart to localStorage with expiration timestamp
  const saveGuestCart = useCallback((cartItems: CartItem[]) => {
    try {
      if (cartItems.length === 0) {
        localStorage.removeItem("tjh_guest_cart");
        return;
      }
      const expiresAt = Date.now() + GUEST_CART_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
      const payload: StoredCart = { items: cartItems, expiresAt };
      localStorage.setItem("tjh_guest_cart", JSON.stringify(payload));
    } catch {}
  }, []);

  // Merge guest cart into user database on login
  useEffect(() => {
    if (isAuthenticated && user && items.length > 0) {
      const syncWithBackend = async () => {
        try {
          for (const item of items) {
            await apiRequest("/cart", {
              method: "POST",
              body: JSON.stringify({
                productId: item.id,
                size: item.size,
                quantity: item.quantity,
              }),
            });
          }
        } catch {
          // Fallback gracefully
        }
      };
      syncWithBackend();
    }
  }, [isAuthenticated, user, items]);

  const addToCart = (
    jersey: Jersey,
    size: "S" | "M" | "L" | "XL" | "XXL" = "L",
    quantity: number = 1,
    customization?: KitCustomization
  ) => {
    const extra = customization?.extraCost || 0;
    const itemPrice = parsePrice(jersey.price) + extra;
    const customKey = customization
      ? `${customization.playerName || ""}-${customization.playerNumber || ""}-${(customization.patches || []).join(",")}`
      : "";

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.id === jersey.id &&
          i.size === size &&
          ((!i.customization && !customization) ||
            (i.customization &&
              `${i.customization.playerName || ""}-${i.customization.playerNumber || ""}-${(i.customization.patches || []).join(",")}` ===
                customKey))
      );
      let updated: CartItem[];

      if (existingIdx > -1) {
        updated = prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem: CartItem = {
          id: jersey.id,
          jersey,
          size,
          quantity,
          priceNumeric: itemPrice,
          customization: customization
            ? {
                ...customization,
                coaMintId:
                  customization.coaMintId ||
                  `MINT-${Math.floor(1000 + Math.random() * 9000)}-${(jersey.club || "TJH")
                    .substring(0, 3)
                    .toUpperCase()}`,
              }
            : undefined,
        };
        updated = [...prev, newItem];
      }

      saveGuestCart(updated);
      return updated;
    });

    setIsCartOpen(true);
  };

  const instantBuy = (
    jersey: Jersey,
    size: "S" | "M" | "L" | "XL" | "XXL" = "L",
    quantity: number = 1,
    customization?: KitCustomization
  ) => {
    addToCart(jersey, size, quantity, customization);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const updateQuantity = (id: string, size: string, quantity: number, customKey?: string) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const updated = prev.filter(
          (i) =>
            !(
              i.id === id &&
              i.size === size &&
              (!customKey ||
                `${i.customization?.playerName || ""}-${i.customization?.playerNumber || ""}-${(i.customization?.patches || []).join(",")}` ===
                  customKey)
            )
        );
        saveGuestCart(updated);
        return updated;
      }

      const updated = prev.map((item) =>
        item.id === id &&
        item.size === size &&
        (!customKey ||
          `${item.customization?.playerName || ""}-${item.customization?.playerNumber || ""}-${(item.customization?.patches || []).join(",")}` ===
            customKey)
          ? { ...item, quantity }
          : item
      );
      saveGuestCart(updated);
      return updated;
    });
  };

  const removeFromCart = (id: string, size: string, customKey?: string) => {
    setItems((prev) => {
      const updated = prev.filter(
        (i) =>
          !(
            i.id === id &&
            i.size === size &&
            (!customKey ||
              `${i.customization?.playerName || ""}-${i.customization?.playerNumber || ""}-${(i.customization?.patches || []).join(",")}` ===
                customKey)
          )
      );
      saveGuestCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    saveGuestCart([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceNumeric * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        currency,
        setCurrency: handleSetCurrency,
        formatPrice,
        isCartOpen,
        isCheckoutOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        addToCart,
        instantBuy,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

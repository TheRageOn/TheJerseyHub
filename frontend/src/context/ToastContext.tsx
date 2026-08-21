"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useTheme } from "./ThemeContext";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { isWhite } = useTheme();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message: string, title?: string) =>
      addToast("success", message, title || "VAULT ACTION SUCCESS"),
    error: (message: string, title?: string) =>
      addToast("error", message, title || "OPERATION FAILED"),
    warning: (message: string, title?: string) =>
      addToast("warning", message, title || "SECURITY / NOTICE"),
    info: (message: string, title?: string) =>
      addToast("info", message, title || "SYSTEM UPDATE"),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-2xl p-4 border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
                isWhite
                  ? "bg-[#faf7f0]/95 border-black/15 text-black shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
                  : "bg-[#101014]/95 border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${
                      isSuccess
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                        : isError
                        ? "bg-red-500/15 text-red-500 border border-red-500/30"
                        : isWarning
                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        : "bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30"
                    }`}
                  >
                    {isSuccess ? "✓" : isError ? "✕" : isWarning ? "⚠" : "ℹ"}
                  </div>

                  <div className="min-w-0 font-mono">
                    <p
                      className={`text-[9.5px] font-bold tracking-widest uppercase ${
                        isSuccess
                          ? "text-emerald-500"
                          : isError
                          ? "text-red-500"
                          : isWarning
                          ? "text-amber-500"
                          : "text-[#ff5500]"
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-xs font-medium leading-snug mt-0.5 break-words opacity-90">
                      {t.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="opacity-40 hover:opacity-100 p-1 text-xs cursor-pointer transition-opacity"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

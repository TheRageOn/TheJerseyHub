"use client";

import React, { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  badgeText?: string;
  message: string;
  highlightText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  badgeText = "VAULT SAFEGUARD",
  message,
  highlightText,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { isWhite } = useTheme();

  // Keyboard shortcut listener: ESC to cancel, Enter to confirm
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && !isLoading) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel, onConfirm]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all duration-300 transform scale-100 ${
          isWhite
            ? "border-black/15 text-[#0c0c0c] shadow-[0_25px_70px_rgba(0,0,0,0.18)]"
            : "border-white/15 text-white shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
        }`}
        style={{
          background: isWhite
            ? "radial-gradient(ellipse at 50% 0%, #ffffff 0%, #faf6ee 60%, #f2ebd9 100%)"
            : "radial-gradient(ellipse at 50% 0%, #1e1e24 0%, #111115 60%, #08080a 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Dismiss Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center rounded-xl font-mono text-xs transition-colors cursor-pointer border ${
            isWhite
              ? "text-black/40 hover:text-black hover:bg-black/5 border-black/10"
              : "text-white/40 hover:text-white hover:bg-white/10 border-white/10"
          }`}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon & Badge Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
              isDanger
                ? "bg-red-500/15 text-red-500 border border-red-500/30"
                : "bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/30"
            }`}
          >
            {isDanger ? "⚠️" : "ℹ️"}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-widest font-bold uppercase">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDanger ? "bg-red-500 animate-pulse" : "bg-[#ff5500]"
              }`}
            />
            <span className={isDanger ? "text-red-500" : "text-[#ff5500]"}>
              {badgeText}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-mono text-lg sm:text-xl font-bold tracking-tight mb-2">
          {title}
        </h3>

        {/* Highlighted Box */}
        {highlightText && (
          <div
            className={`p-3.5 my-3 rounded-2xl border font-mono text-xs ${
              isDanger
                ? "bg-red-500/10 border-red-500/25 text-red-400 font-semibold"
                : "bg-[#ff5500]/10 border-[#ff5500]/25 text-[#ff5500] font-semibold"
            }`}
          >
            {highlightText}
          </div>
        )}

        {/* Body Message */}
        <p className="text-xs font-mono opacity-70 leading-relaxed mt-1 mb-6">
          {message}
        </p>

        {/* Actions Row */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/5 dark:border-white/5 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`px-4 sm:px-5 py-2.5 rounded-xl border transition-all cursor-pointer min-h-[42px] ${
              isWhite
                ? "border-black/15 hover:bg-black/5 text-black/80"
                : "border-white/15 hover:bg-white/10 text-white/80"
            }`}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 sm:px-6 py-2.5 rounded-xl text-white uppercase tracking-wider transition-all cursor-pointer shadow-lg min-h-[42px] flex items-center justify-center gap-2 ${
              isDanger
                ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-500/25"
                : "bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] shadow-[#ff5500]/25"
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

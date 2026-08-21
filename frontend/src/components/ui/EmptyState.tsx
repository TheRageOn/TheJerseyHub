"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  badge?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  badge = "VAULT STATUS // EMPTY",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  const { isWhite } = useTheme();

  return (
    <div
      className={`w-full rounded-3xl p-8 sm:p-12 border text-center font-mono flex flex-col items-center justify-center transition-all ${
        isWhite
          ? "bg-white/80 border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.03)] text-black"
          : "bg-[#101014]/90 border-white/10 shadow-xl text-white"
      } ${className}`}
    >
      {/* Icon Capsule */}
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl border ${
          isWhite
            ? "bg-black/5 border-black/10 text-black/60"
            : "bg-white/5 border-white/10 text-white/60"
        }`}
      >
        {icon || (
          <svg className="w-7 h-7 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500]" />
        <span className="text-[10px] tracking-widest text-[#ff5500] uppercase font-bold">
          {badge}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold tracking-tight mb-1 max-w-md">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs opacity-60 max-w-sm leading-relaxed mb-6 font-normal">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="px-5 py-2.5 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
          >
            {actionLabel}
          </Link>
        )}

        {actionLabel && onAction && !actionHref && (
          <button
            type="button"
            onClick={onAction}
            className="px-5 py-2.5 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_15px_rgba(255,85,0,0.35)] cursor-pointer"
          >
            {actionLabel}
          </button>
        )}

        {secondaryLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              isWhite
                ? "border-black/15 hover:bg-black/5 text-black/80"
                : "border-white/15 hover:bg-white/10 text-white/80"
            }`}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

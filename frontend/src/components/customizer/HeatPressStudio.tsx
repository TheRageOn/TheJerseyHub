"use client";

import React, { useState } from "react";
import { DBJersey } from "@/services/productService";
import { useCart, KitCustomization } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";

interface HeatPressStudioProps {
  isOpen: boolean;
  jersey: DBJersey | null;
  onClose: () => void;
}

const LEGEND_PRESETS: Record<string, { name: string; number: string }[]> = {
  default: [
    { name: "MESSI", number: "10" },
    { name: "RONALDO", number: "7" },
    { name: "ZIDANE", number: "21" },
    { name: "BELLINGHAM", number: "5" },
    { name: "HENRY", number: "14" },
    { name: "MARADONA", number: "10" },
  ],
};

const SLEEVE_PATCHES = [
  { id: "ucl", tag: "UCL", label: "UEFA Champions League Starball", cost: 15 },
  { id: "wc", tag: "FIFA", label: "FIFA World Cup Champions Shield", cost: 15 },
  { id: "epl", tag: "PL", label: "Premier League Gold Champions Lion", cost: 15 },
];

const VINYL_COLORS = [
  { id: "white", label: "Pure White", hex: "#ffffff" },
  { id: "black", label: "Matte Black", hex: "#111111" },
  { id: "gold", label: "Champions Gold", hex: "#d4af37" },
  { id: "red", label: "Classic Red", hex: "#c8102e" },
];

export default function HeatPressStudio({ isOpen, jersey, onClose }: HeatPressStudioProps) {
  const { isWhite } = useTheme();
  const { addToCart, instantBuy, formatPrice } = useCart();

  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L" | "XL" | "XXL">("L");
  const [playerName, setPlayerName] = useState("MESSI");
  const [playerNumber, setPlayerNumber] = useState("10");
  const [selectedPatches, setSelectedPatches] = useState<string[]>(["ucl"]);
  const [vinylColor, setVinylColor] = useState<string>("white");

  if (!isOpen || !jersey) return null;

  const basePriceNum = parseFloat(jersey.price.replace(/[^0-9.]/g, "")) || 125;
  const patchCost = selectedPatches.length * 15;
  const printCost = (playerName.trim() || playerNumber.trim()) ? 15 : 0;
  const totalExtra = patchCost + printCost;
  const grandTotal = basePriceNum + totalExtra;

  const activeColorObj = VINYL_COLORS.find((c) => c.id === vinylColor) || VINYL_COLORS[0];

  const handleTogglePatch = (patchId: string) => {
    setSelectedPatches((prev) =>
      prev.includes(patchId) ? prev.filter((p) => p !== patchId) : [...prev, patchId]
    );
  };

  const handleApplyPreset = (preset: { name: string; number: string }) => {
    setPlayerName(preset.name);
    setPlayerNumber(preset.number);
  };

  const getCustomizationData = (): KitCustomization => ({
    playerName: playerName.trim().toUpperCase(),
    playerNumber: playerNumber.trim(),
    patches: selectedPatches,
    extraCost: totalExtra,
    coaMintId: `CUSTOM-PRESS-#${Math.floor(1000 + Math.random() * 9000)}-${(jersey.club || "TJH").substring(0, 3).toUpperCase()}`,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 transition-all duration-200 border ${
          isWhite
            ? "bg-[#faf8f5] border-black/10 text-[#0f0f0f] shadow-2xl"
            : "bg-[#111114] border-white/10 text-white shadow-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 z-30 w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer font-mono text-xs border ${
            isWhite
              ? "bg-black/5 hover:bg-black/10 text-black border-black/10"
              : "bg-white/5 hover:bg-white/10 text-white border-white/10"
          }`}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-5 border-b pb-4 border-black/10 dark:border-white/10 pr-10">
          <span className="font-mono text-[10px] tracking-widest uppercase opacity-40 font-semibold block mb-1">
            HEAT-PRESS ATELIER // CUSTOM PRINTING
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
            Customize {jersey.name}
          </h2>
          <p className="text-xs opacity-50 mt-0.5 font-mono">
            Specify player name, squad number, vinyl pigment, and tournament badges.
          </p>
        </div>

        <div className="space-y-4 font-mono text-xs">
          
          {/* Quick Legend Presets */}
          <div>
            <label className="block text-[10px] uppercase opacity-50 mb-1.5 font-semibold tracking-wider">
              Legend Presets:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {LEGEND_PRESETS.default.map((preset) => (
                <button
                  key={`${preset.name}-${preset.number}`}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer truncate text-center ${
                    playerName === preset.name && playerNumber === preset.number
                      ? "border-[#ff5500] bg-[#ff5500]/10 text-[#ff5500]"
                      : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5"
                  }`}
                >
                  {preset.name} #{preset.number}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Name & Number Input */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] uppercase opacity-50 mb-1 font-semibold tracking-wider">
                Player Name
              </label>
              <input
                type="text"
                maxLength={12}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                placeholder="e.g. ANSARI"
                className={`w-full h-10 px-3 rounded-xl border outline-none font-bold uppercase transition-colors text-xs ${
                  isWhite
                    ? "bg-white border-black/15 focus:border-black/40 text-black"
                    : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                }`}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase opacity-50 mb-1 font-semibold tracking-wider">
                Squad Number
              </label>
              <input
                type="text"
                maxLength={2}
                value={playerNumber}
                onChange={(e) => setPlayerNumber(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="10"
                className={`w-full h-10 px-3 rounded-xl border outline-none font-bold text-center transition-colors text-xs ${
                  isWhite
                    ? "bg-white border-black/15 focus:border-black/40 text-black"
                    : "bg-[#18181c] border-white/10 focus:border-white/30 text-white"
                }`}
              />
            </div>
          </div>

          {/* Vinyl Lettering Color */}
          <div>
            <label className="block text-[10px] uppercase opacity-50 mb-1.5 font-semibold tracking-wider">
              Vinyl Lettering Pigment:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VINYL_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setVinylColor(c.id)}
                  className={`py-2 px-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[10.5px] font-bold ${
                    vinylColor === c.id
                      ? "border-[#ff5500] bg-[#ff5500]/10 text-white"
                      : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                  </div>
                  {vinylColor === c.id && <span className="text-[#ff5500] text-[9px]">●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <label className="block text-[10px] uppercase opacity-50 mb-1.5 font-semibold tracking-wider">
              Select Fit Size:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(["S", "M", "L", "XL", "XXL"] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedSize === sz
                      ? "border-[#ff5500] bg-[#ff5500] text-white shadow-sm"
                      : isWhite
                      ? "border-black/10 hover:border-black/30 bg-black/5 text-black"
                      : "border-white/10 hover:border-white/30 bg-white/5 text-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Sleeve Patches Suite */}
          <div>
            <label className="block text-[10px] uppercase opacity-50 mb-1.5 font-semibold tracking-wider">
              Official Sleeve Badges (+ $15 each):
            </label>
            <div className="space-y-1.5">
              {SLEEVE_PATCHES.map((patch) => {
                const isSelected = selectedPatches.includes(patch.id);
                return (
                  <button
                    key={patch.id}
                    type="button"
                    onClick={() => handleTogglePatch(patch.id)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-[#ff5500] bg-[#ff5500]/10 text-white"
                        : "border-black/10 dark:border-white/10 opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                        [{patch.tag}]
                      </span>
                      <span className={`text-[11px] font-bold ${isSelected ? "text-[#ff5500]" : ""}`}>
                        {patch.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold">
                      {isSelected ? "[ATTACHED]" : "+ $15.00"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Summary Breakdown */}
          <div
            className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
              isWhite ? "bg-black/[0.02] border-black/10" : "bg-white/[0.02] border-white/10"
            }`}
          >
            <div className="flex justify-between opacity-60">
              <span>Base Kit Specification:</span>
              <span>{formatPrice(basePriceNum)}</span>
            </div>
            {printCost > 0 && (
              <div className="flex justify-between opacity-60">
                <span>Heat-Press Vinyl Printing ({activeColorObj.label}):</span>
                <span>+{formatPrice(printCost)}</span>
              </div>
            )}
            {patchCost > 0 && (
              <div className="flex justify-between opacity-60">
                <span>Tournament Sleeve Badges ({selectedPatches.length}):</span>
                <span>+{formatPrice(patchCost)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10 font-bold text-sm">
              <span>Total Customized:</span>
              <span className="text-[#ff5500]">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                addToCart(jersey, selectedSize, 1, getCustomizationData());
                onClose();
              }}
              className={`py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer text-center ${
                isWhite
                  ? "border-black/15 hover:bg-black/5 text-black"
                  : "border-white/20 hover:bg-white/10 text-white"
              }`}
            >
              Add to Bag
            </button>
            <button
              type="button"
              onClick={() => {
                instantBuy(jersey, selectedSize, 1, getCustomizationData());
                onClose();
              }}
              className="py-3 px-4 bg-[#ff5500] hover:bg-[#ff661a] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all text-center"
            >
              Instant Buy →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

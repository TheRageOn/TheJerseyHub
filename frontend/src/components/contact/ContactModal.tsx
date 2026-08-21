"use client";

import React, { useState, useEffect } from "react";

interface ContactModalProps {
  isOpen: boolean;
  theme?: "white" | "black";
  onClose: () => void;
}

const RELEVANT_SUBJECTS = [
  "Order Status & Tracking",
  "Vault Edition / Product Inquiry",
  "Cash on Delivery (COD) Assistance",
  "Authentication & Verification",
  "Wholesale / Collector Partnership",
  "General Support",
];

export default function ContactModal({
  isOpen,
  theme = "white",
  onClose,
}: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: RELEVANT_SUBJECTS[0],
    message: "",
  });
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const isWhite = theme === "white";
  const recipientEmail = "nantio.official@gmail.com";

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(recipientEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Construct mailto URI with prefilled fields
    const subject = encodeURIComponent(`[${formData.subject}] Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.subject}\n\nMessage:\n${formData.message}`
    );
    const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    // Open user's default email client
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setStatus("sent");
      setTimeout(() => {
        setStatus("idle");
        onClose();
      }, 1500);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 
        Editorial Gradient Contact Modal Panel
      */}
      <div
        className={`relative w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-8 transition-all duration-300 ${
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
        {/* Top Amber Highlight Glow */}
        <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#ff5500]/60 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer text-sm leading-none ${
            isWhite
              ? "text-black/40 hover:text-black hover:bg-black/5"
              : "text-white/40 hover:text-white hover:bg-white/10"
          }`}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-[#ff5500] uppercase font-semibold">
              CONTACT DESK
            </span>
          </div>
          <h2
            className={`text-2xl font-bold tracking-tight mb-1 ${
              isWhite ? "text-[#0a0a0a]" : "text-white"
            }`}
          >
            Get in touch
          </h2>
          <p
            className={`text-xs ${
              isWhite ? "text-black/50" : "text-white/50"
            }`}
          >
            Send direct inquiries to our archive support team.
          </p>
        </div>

        {/* ── Recipient Badge with Copy Button ──────────────────────── */}
        <div
          className={`mb-5 p-3 rounded-xl flex items-center justify-between border ${
            isWhite
              ? "bg-black/5 border-black/10"
              : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <svg
              className="w-4 h-4 text-[#ff5500] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span
              className={`text-xs font-mono truncate ${
                isWhite ? "text-black/80" : "text-white/80"
              }`}
            >
              {recipientEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyEmail}
            className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              copied
                ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                : isWhite
                ? "bg-white border-black/10 text-black/70 hover:text-black hover:border-black/25"
                : "bg-white/10 border-white/10 text-white/70 hover:text-white hover:border-white/25"
            }`}
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>

        {/* ── Feedback Banner ───────────────────────────────────────── */}
        {status === "sent" && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-center gap-2">
            <span>✓ Opening your email client... Thank you!</span>
          </div>
        )}

        {/* ── Contact Form ──────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Row 1: Name */}
          <div>
            <label
              className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                isWhite ? "text-black/70" : "text-white/70"
              }`}
            >
              Your Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Liam Foster"
              className={`w-full h-10 px-3.5 rounded-xl text-xs outline-none transition-all ${
                isWhite
                  ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                  : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
              }`}
            />
          </div>

          {/* Row 2: Two Columns - Email & Subject Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                  isWhite ? "text-black/70" : "text-white/70"
                }`}
              >
                Your Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="liam@example.com"
                className={`w-full h-10 px-3.5 rounded-xl text-xs outline-none transition-all ${
                  isWhite
                    ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                    : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                  isWhite ? "text-black/70" : "text-white/70"
                }`}
              >
                Subject Topic
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-xl text-xs outline-none transition-all cursor-pointer ${
                  isWhite
                    ? "bg-white/80 border border-black/10 text-black focus:border-[#ff5500]"
                    : "bg-[#16161a] border border-white/10 text-white focus:border-[#ff5500]"
                }`}
              >
                {RELEVANT_SUBJECTS.map((item) => (
                  <option key={item} value={item} className={isWhite ? "bg-white text-black" : "bg-[#16161a] text-white"}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Message */}
          <div>
            <label
              className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                isWhite ? "text-black/70" : "text-white/70"
              }`}
            >
              Message
            </label>
            <textarea
              name="message"
              required
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your inquiry or question here..."
              className={`w-full p-3 rounded-xl text-xs outline-none resize-none transition-all ${
                isWhite
                  ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                  : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
              }`}
            />
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full h-11 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,85,0,0.35)] hover:shadow-[0_8px_25px_rgba(255,85,0,0.5)] active:scale-[0.99]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{status === "sending" ? "Opening mail client..." : "Send to nantio.official@gmail.com"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

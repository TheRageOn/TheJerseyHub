"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "signup";
  theme?: "white" | "black";
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "login",
  theme = "white",
  onClose,
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <AuthModalContent
      key={`${initialMode}-${theme}`}
      initialMode={initialMode}
      theme={theme}
      onClose={onClose}
    />
  );
}

function AuthModalContent({
  initialMode,
  theme,
  onClose,
}: {
  initialMode: "login" | "signup";
  theme: "white" | "black";
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const isWhite = theme === "white";
  const isLogin = mode === "login";

  const { login, register } = useAuth();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await register(formData.name, formData.email, formData.password, formData.phone);

      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Authentication failed");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setStatus("error");
      setErrorMessage(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${
          isLogin ? "max-w-[430px]" : "max-w-[500px]"
        } max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 transition-all duration-200 border ${
          isWhite
            ? "bg-[#faf8f5] border-black/10 text-[#0f0f0f] shadow-2xl"
            : "bg-[#111114] border-white/10 text-white shadow-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
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
        <div className="mb-6">
          <h2
            className={`text-2xl font-bold tracking-tight mb-1 ${
              isWhite ? "text-[#0a0a0a]" : "text-white"
            }`}
          >
            {isLogin ? "Sign in to your account" : "Create an account"}
          </h2>
          <p
            className={`text-xs ${
              isWhite ? "text-black/50" : "text-white/50"
            }`}
          >
            {isLogin
              ? "Access your saved orders, bag, and profile."
              : "Register for faster checkout and order tracking."}
          </p>
        </div>

        {/* Feedback Alert */}
        {errorMessage && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-xs flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        {status === "success" && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-center gap-2">
            <span>
              {isLogin ? "Welcome back!" : "Account registered successfully!"}
            </span>
          </div>
        )}

        {/* ── Auth Form ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin ? (
            <>
              {/* Row 1: Full Name & Email in One Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                      isWhite ? "text-black/70" : "text-white/70"
                    }`}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isWhite ? "text-black/35" : "text-white/35"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Alex Mercer"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl text-xs outline-none transition-all ${
                        isWhite
                          ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                          : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                      isWhite ? "text-black/70" : "text-white/70"
                    }`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isWhite ? "text-black/35" : "text-white/35"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@domain.com"
                      className={`w-full h-10 pl-9 pr-3 rounded-xl text-xs outline-none transition-all ${
                        isWhite
                          ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                          : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone Number */}
              <div>
                <label
                  className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                    isWhite ? "text-black/70" : "text-white/70"
                  }`}
                >
                  Phone Number <span className="opacity-50 lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isWhite ? "text-black/35" : "text-white/35"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+977 98..."
                    className={`w-full h-10 pl-9 pr-3 rounded-xl text-xs outline-none transition-all ${
                      isWhite
                        ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                        : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Password & Confirm Password in One Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                      isWhite ? "text-black/70" : "text-white/70"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isWhite ? "text-black/35" : "text-white/35"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full h-10 pl-9 pr-9 rounded-xl text-xs outline-none transition-all ${
                        isWhite
                          ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                          : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer ${
                        isWhite ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"
                      }`}
                    >
                      {showPassword ? "👁" : "👁‍🗨"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                      isWhite ? "text-black/70" : "text-white/70"
                    }`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div
                      className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                        isWhite ? "text-black/35" : "text-white/35"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full h-10 pl-9 pr-9 rounded-xl text-xs outline-none transition-all ${
                        isWhite
                          ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                          : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer ${
                        isWhite ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"
                      }`}
                    >
                      {showConfirmPassword ? "👁" : "👁‍🗨"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Login Mode Fields */
            <>
              <div>
                <label
                  className={`block text-[10.5px] font-medium uppercase tracking-wider mb-1 ${
                    isWhite ? "text-black/70" : "text-white/70"
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isWhite ? "text-black/35" : "text-white/35"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@domain.com"
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none transition-all ${
                      isWhite
                        ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                        : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className={`text-[10.5px] font-medium uppercase tracking-wider ${
                      isWhite ? "text-black/70" : "text-white/70"
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[#ff5500] hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                      isWhite ? "text-black/35" : "text-white/35"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className={`w-full h-11 pl-10 pr-10 rounded-xl text-sm outline-none transition-all ${
                      isWhite
                        ? "bg-white/80 border border-black/10 text-black placeholder-black/30 focus:border-[#ff5500]"
                        : "bg-[#16161a] border border-white/10 text-white placeholder-white/25 focus:border-[#ff5500]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer ${
                      isWhite ? "text-black/40 hover:text-black" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {showPassword ? "👁" : "👁‍🗨"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Primary Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-11 bg-gradient-to-r from-[#ff5500] to-[#e64000] hover:from-[#ff6614] hover:to-[#f04800] text-white text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,85,0,0.35)] hover:shadow-[0_8px_25px_rgba(255,85,0,0.5)] active:scale-[0.99]"
            >
              {status === "loading" ? (
                <span>Verifying credentials...</span>
              ) : isLogin ? (
                <>
                  <span>Sign In</span>
                  <span className="text-sm">→</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="text-sm">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── Or Divider ───────────────────────────────────────────── */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div
              className={`w-full border-t ${
                isWhite ? "border-black/10" : "border-white/10"
              }`}
            />
          </div>
          <div className="relative flex justify-center text-xs">
            <span
              className={`px-3 uppercase tracking-wider text-[9.5px] rounded-full ${
                isWhite
                  ? "bg-[#f5efe4] text-black/40"
                  : "bg-[#101013] text-white/40"
              }`}
            >
              or
            </span>
          </div>
        </div>

        {/* ── Social Logins ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              login("shopper@example.com", "password123");
              setStatus("success");
              setTimeout(onClose, 800);
            }}
            className={`h-10 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isWhite
                ? "bg-white border border-black/10 text-black hover:bg-black/5 shadow-sm"
                : "bg-[#1a1a20] hover:bg-[#24242c] border border-white/10 text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.76 1.04-1.82.93-2.87-.9.04-2 .6-2.65 1.36-.58.67-1.09 1.76-.95 2.79 1.01.08 2.05-.52 2.67-1.28z" />
            </svg>
            <span>Apple</span>
          </button>

          <button
            type="button"
            onClick={() => {
              login("shopper@example.com", "password123");
              setStatus("success");
              setTimeout(onClose, 800);
            }}
            className={`h-10 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isWhite
                ? "bg-white border border-black/10 text-black hover:bg-black/5 shadow-sm"
                : "bg-[#1a1a20] hover:bg-[#24242c] border border-white/10 text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* ── Switcher Bottom Link ──────────────────────────────────── */}
        <div
          className={`text-center text-xs ${
            isWhite ? "text-black/50" : "text-white/50"
          }`}
        >
          {isLogin ? (
            <p>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setStatus("idle");
                  setErrorMessage("");
                }}
                className="text-[#ff5500] font-semibold hover:underline cursor-pointer ml-1"
              >
                Create account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStatus("idle");
                  setErrorMessage("");
                }}
                className="text-[#ff5500] font-semibold hover:underline cursor-pointer ml-1"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
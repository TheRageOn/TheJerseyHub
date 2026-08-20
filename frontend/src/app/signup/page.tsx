"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("TERMS_REQUIRED // ACCEPT TERMS TO PROCEED");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError("INPUT_EMPTY // ALL FIELDS REQUIRED");
      return;
    }
    if (password.length < 6) {
      setError("SECURITY_POLICY // MIN 6 CHARACTERS");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "REGISTRATION_FAILED";
      setError(msg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout pageType="signup">
      <div className="w-full flex flex-col gap-6">
        {/* Header Title Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#ff5500] uppercase">
            <span>•</span>
            <span>MEMBERSHIP INITIATION // 2026</span>
          </div>
          <h1 className="font-mono text-[28px] sm:text-[36px] font-bold tracking-[0.06em] uppercase text-current leading-none">
            [CREATE ACCOUNT]
          </h1>
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.14em] opacity-60 uppercase leading-relaxed mt-1">
            ACQUIRE ARCHIVED MATCH ACCESS // ENTER DETAILS
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-[2px] border border-[#ff5500]/40 bg-[#ff5500]/10 font-mono text-[10px] sm:text-[11px] tracking-[0.14em] text-[#ff5500] uppercase flex items-center gap-2">
            <span>⚠</span>
            <span>[ERROR : {error}]</span>
          </div>
        )}

        {/* Primary Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-75 font-medium">
              FULL NAME //
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="COLLECTOR NAME"
              autoComplete="name"
              required
              className="w-full h-11 px-3.5 rounded-[2px] border border-current/20 focus:border-current/70 bg-current/[0.03] font-mono text-[12px] tracking-[0.06em] outline-none transition-colors placeholder:opacity-25 uppercase"
            />
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-75 font-medium">
              EMAIL ADDRESS //
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="COLLECTOR@THEJERSEYHUB.COM"
              autoComplete="email"
              required
              className="w-full h-11 px-3.5 rounded-[2px] border border-current/20 focus:border-current/70 bg-current/[0.03] font-mono text-[12px] tracking-[0.06em] outline-none transition-colors placeholder:opacity-25 uppercase"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-75 font-medium">
              PHONE NUMBER //
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+977 9800000000"
              autoComplete="tel"
              required
              className="w-full h-11 px-3.5 rounded-[2px] border border-current/20 focus:border-current/70 bg-current/[0.03] font-mono text-[12px] tracking-[0.06em] outline-none transition-colors placeholder:opacity-25"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-75 font-medium">
                PASSWORD //
              </label>
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase opacity-40">
                [MIN 6 CHARS]
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              required
              className="w-full h-11 px-3.5 rounded-[2px] border border-current/20 focus:border-current/70 bg-current/[0.03] font-mono text-[12px] tracking-[0.06em] outline-none transition-colors placeholder:opacity-25"
            />
          </div>

          {/* Terms Acceptance Checkbox */}
          <div className="pt-1 pb-1">
            <label className="flex items-start gap-2.5 cursor-pointer font-mono text-[9.5px] sm:text-[10px] tracking-[0.12em] uppercase leading-relaxed select-none">
              <button
                type="button"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className={`w-4 h-4 flex-shrink-0 mt-0.5 rounded-[0px] border flex items-center justify-center font-mono text-[10px] font-bold transition-all cursor-pointer ${
                  acceptedTerms
                    ? "bg-black text-white dark:bg-white dark:text-black border-current"
                    : "border-current/30 bg-transparent hover:border-current/60"
                }`}
                aria-checked={acceptedTerms}
                role="checkbox"
              >
                {acceptedTerms ? "X" : ""}
              </button>
              <span className="opacity-75">
                I ACCEPT THE{" "}
                <Link
                  href="/terms"
                  className="text-[#ff5500] hover:underline underline-offset-2"
                >
                  [TERMS OF SERVICE]
                </Link>{" "}
                AND{" "}
                <Link
                  href="/privacy"
                  className="text-[#ff5500] hover:underline underline-offset-2"
                >
                  [PRIVACY POLICY]
                </Link>
              </span>
            </label>
          </div>

          {/* Flat Action Button */}
          <button
            type="submit"
            disabled={!acceptedTerms || loading}
            className={`w-full h-12 mt-1 rounded-[2px] bg-black text-white dark:bg-white dark:text-black font-mono text-[11px] tracking-[0.22em] uppercase font-bold transition-all flex items-center justify-center ${
              !acceptedTerms || loading
                ? "opacity-30 cursor-not-allowed"
                : "hover:opacity-85 active:scale-[0.99] cursor-pointer shadow-sm"
            }`}
          >
            {loading ? "[REGISTERING...]" : "[INITIALIZE MEMBERSHIP]"}
          </button>
        </form>

        {/* Dashed Rule Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="w-full border-t border-dashed border-current/20" />
          <span className="absolute px-3 bg-inherit font-mono text-[8.5px] sm:text-[9px] tracking-[0.2em] opacity-40 uppercase">
            [OR CONTINUE WITH]
          </span>
        </div>

        {/* Flat Bracket SSO Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-10 flex items-center justify-center gap-2 rounded-[2px] border border-current/20 hover:border-current/60 hover:bg-current/[0.04] transition-all font-mono text-[10px] tracking-[0.16em] uppercase opacity-80 hover:opacity-100 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>[GOOGLE]</span>
          </button>

          <button
            type="button"
            className="h-10 flex items-center justify-center gap-2 rounded-[2px] border border-current/20 hover:border-current/60 hover:bg-current/[0.04] transition-all font-mono text-[10px] tracking-[0.16em] uppercase opacity-80 hover:opacity-100 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.94 1.07.08 2.16-.54 2.79-1.28z" />
            </svg>
            <span>[APPLE]</span>
          </button>
        </div>

        {/* Switch Link */}
        <div className="text-center font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase mt-2">
          <span className="opacity-60">ALREADY REGISTERED? </span>
          <Link
            href="/login"
            className="font-bold underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity"
          >
            [AUTHENTICATE]
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

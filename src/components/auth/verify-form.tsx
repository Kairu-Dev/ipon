"use client";
import Link from "next/link";
import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { AUTH_STRINGS } from "@/locale/auth";

export function VerifyForm() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      
      // Focus the next empty input or the last one
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs[focusIndex].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    setIsSubmitting(true);

    try {
      // Mock API call for mockup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Verified code:", fullCode);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-12">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-2 text-primary mb-8">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
        <span className="font-h2 text-h2 tracking-tight">{AUTH_STRINGS.BRAND_NAME}</span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-h2 text-h2 text-on-surface">{AUTH_STRINGS.VERIFY_TITLE}</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {AUTH_STRINGS.VERIFY_SUBTITLE} j***@example.com
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Verification Code Fields */}
        <div className="flex justify-between gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center font-h2 text-h2 text-on-surface bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          ))}
        </div>

        {/* Resend Action */}
        <div className="font-label-xs text-label-xs text-on-surface-variant font-medium">
          {AUTH_STRINGS.VERIFY_RESEND} <span className="text-primary font-bold">0:59</span>
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting || code.join("").length !== 6}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
              Verifying...
            </>
          ) : (
            <>
              {AUTH_STRINGS.BTN_VERIFY}
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="flex justify-center mt-2">
        <Link href="/login" className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors">
          {AUTH_STRINGS.LINK_CHANGE_EMAIL}
        </Link>
      </div>
    </div>
  );
}

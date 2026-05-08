"use client";
import Link from "next/link";
import { useState } from "react";
import { AUTH_STRINGS } from "@/locale/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // On-submit validation
    const emailError = !email.trim() ? AUTH_STRINGS.ERR_REQ_EMAIL : undefined;
    setFieldErrors({ email: emailError });

    if (emailError) return;

    setIsSubmitting(true);

    try {
      // Mock API call for mockup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real flow, this would send the reset email
      console.log("Password reset email sent to", email);
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

      <div className="flex flex-col gap-8">
        <Link href="/login" className="flex items-center gap-2 font-label-md text-label-md text-outline hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
          {AUTH_STRINGS.LINK_BACK_TO_LOGIN}
        </Link>
        
        <div className="flex flex-col gap-2">
          <h2 className="font-h2 text-h2 text-on-surface">{AUTH_STRINGS.FORGOT_PASSWORD_TITLE}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{AUTH_STRINGS.FORGOT_PASSWORD_SUBTITLE}</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="email">{AUTH_STRINGS.LABEL_EMAIL}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">mail</span>
            </div>
            <input 
              className={`w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border rounded outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant ${
                fieldErrors.email
                  ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                  : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
              }`} 
              id="email" 
              name="email" 
              placeholder="e.g. juan.delacruz@example.com" 
              type="email" 
              required 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }} 
            />
          </div>
          {fieldErrors.email && (
            <p className="font-body-sm text-xs text-error mt-1">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
              Sending...
            </>
          ) : (
            <>
              {AUTH_STRINGS.BTN_RESET_PASSWORD}
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Link */}
      <div className="flex justify-center mt-4">
        <Link href="/login" className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors">
          {AUTH_STRINGS.LINK_REMEMBER_PASSWORD.split("?")[0]}? <span className="text-primary">{AUTH_STRINGS.LINK_REMEMBER_PASSWORD.split("?")[1].trim()}</span>
        </Link>
      </div>
    </div>
  );
}

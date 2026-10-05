// src/components/auth/login-form.tsx
// Login form wired to Clerk custom authentication flow.
"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AUTH_STRINGS } from "@/locale/auth";

export function LoginForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Reset loading states when navigating back via browser back-forward cache (bfcache)
  useEffect(() => {
    const handlePageShow = () => {
      setIsOAuthLoading(null);
      setIsSubmitting(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError("");

    // On-submit validation
    const emailError = !email.trim() ? AUTH_STRINGS.ERR_REQ_EMAIL : undefined;
    const passwordError = !password ? AUTH_STRINGS.ERR_REQ_PASSWORD : undefined;

    setFieldErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Further verification required to complete sign in.");
      }
    } catch (err: unknown) {
      const clerkErr = err as {
        errors?: Array<{
          code?: string;
          paramName?: string;
          longMessage?: string;
          message?: string;
        }>;
      };
      const firstErr = clerkErr.errors?.[0];
      const msg = firstErr?.longMessage || firstErr?.message || AUTH_STRINGS.ERR_INVALID_CREDENTIALS;
      const param = firstErr?.paramName;
      const lower = msg.toLowerCase();

      if (
        param === "identifier" ||
        param === "email_address" ||
        lower.includes("email") ||
        lower.includes("user not found") ||
        lower.includes("identifier")
      ) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      } else if (param === "password" || lower.includes("password") || lower.includes("credential")) {
        setFieldErrors((prev) => ({ ...prev, password: msg }));
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded || !signIn) return;
    setError("");
    setIsOAuthLoading(strategy);

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
        continueSignUp: true,
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }> };
      setError(clerkErr.errors?.[0]?.message || "Failed to initiate social login.");
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-12">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-2 text-primary mb-8">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
        <span className="font-h2 text-h2 tracking-tight">{AUTH_STRINGS.BRAND_NAME}</span>
      </div>

      {/* Form Header & Toggle */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-h2 text-h2 text-on-surface">{AUTH_STRINGS.LOGIN_TITLE}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{AUTH_STRINGS.LOGIN_SUBTITLE}</p>
        </div>
        {/* Tabs */}
        <div className="flex p-1 bg-surface-container rounded-lg">
          <button className="flex-1 py-2 text-center rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-all border border-outline-variant/20">
            {AUTH_STRINGS.TAB_LOGIN}
          </button>
          <Link href="/sign-up" className="flex-1 py-2 text-center rounded text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all">
            {AUTH_STRINGS.TAB_SIGNUP}
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="email">{AUTH_STRINGS.LABEL_EMAIL_SHORT}</label>
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
              value={email}
              placeholder={AUTH_STRINGS.PLACEHOLDER_EMAIL} 
              type="email" 
              required 
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }} 
            />
          </div>
          {fieldErrors.email && (
            <p className="font-body-sm text-xs text-error mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm shrink-0" aria-hidden="true">error</span>
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">{AUTH_STRINGS.LABEL_PASSWORD}</label>
            <Link className="font-label-xs text-label-xs text-primary hover:text-primary-container transition-colors" href="/forgot-password">{AUTH_STRINGS.LINK_FORGOT_PASSWORD}</Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">lock</span>
            </div>
            <input 
              className={`w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border rounded outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant ${
                fieldErrors.password
                  ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                  : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
              }`} 
              id="password" 
              name="password" 
              value={password}
              placeholder={AUTH_STRINGS.PLACEHOLDER_CONFIRM} 
              type={showPassword ? "text" : "password"} 
              required 
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {fieldErrors.password && (
            <p className="font-body-sm text-xs text-error mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm shrink-0" aria-hidden="true">error</span>
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Action-Anchored General / System Error */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-error-container/15 border border-error/30 rounded-xl text-error font-body-sm text-xs transition-all shadow-xs animate-in fade-in">
            <span className="material-symbols-outlined text-base shrink-0" aria-hidden="true">error</span>
            <span className="leading-snug flex-1">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          type="submit"
          disabled={isSubmitting || !isLoaded}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
              {AUTH_STRINGS.BTN_LOGIN_LOADING}
            </>
          ) : (
            <>
              {AUTH_STRINGS.BTN_LOGIN}
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </>
          )}
        </button>

        {/* Turnstile Captcha Widget */}
        <div id="clerk-captcha" className="my-2 flex justify-center" />
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-outline-variant/40"></div>
        <span className="font-label-xs text-label-xs text-outline">{AUTH_STRINGS.DIVIDER_TEXT}</span>
        <div className="flex-1 h-px bg-outline-variant/40"></div>
      </div>

      {/* Social SSO Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest border border-outline-variant rounded text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md disabled:opacity-60 cursor-pointer"
          type="button"
          onClick={() => handleOAuth("oauth_google")}
          disabled={!isLoaded || isOAuthLoading !== null}
        >
          {isOAuthLoading === "oauth_google" ? (
            <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
          )}
          {AUTH_STRINGS.BTN_OAUTH_GOOGLE}
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest border border-outline-variant rounded text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md disabled:opacity-60 cursor-pointer"
          type="button"
          onClick={() => handleOAuth("oauth_apple")}
          disabled={!isLoaded || isOAuthLoading !== null}
        >
          {isOAuthLoading === "oauth_apple" ? (
            <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.13.65-2.79 1.42-.58.67-1.09 1.74-1.03 2.79 1.07.08 2.19-.57 2.81-1.34z" />
            </svg>
          )}
          {AUTH_STRINGS.BTN_OAUTH_APPLE}
        </button>
      </div>
    </div>
  );
}

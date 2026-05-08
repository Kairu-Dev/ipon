// src/components/auth/login-form.tsx
// Login form wired to Convex Auth Password provider.
// Design is preserved exactly — only the auth logic has changed.
"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AUTH_STRINGS } from "@/locale/auth";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");

  const loginAllowed = useQuery(
    api.loginAttempts.checkLoginAllowed,
    loginEmail ? { email: loginEmail } : "skip"
  );
  const recordFailed = useMutation(api.loginAttempts.recordFailedLogin);
  const resetAttempts = useMutation(api.loginAttempts.resetLoginAttempts);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setLoginEmail(email);

    // On-submit validation
    const emailError = !email.trim() ? AUTH_STRINGS.ERR_REQ_EMAIL : undefined;
    const passwordError = !password ? AUTH_STRINGS.ERR_REQ_PASSWORD : undefined;

    setFieldErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    // Check rate limit before attempting login
    if (loginAllowed && !loginAllowed.ok) {
      const minutes = Math.ceil((loginAllowed.retryAfter || 0) / 60000);
      setError(AUTH_STRINGS.rateLimitMessage(minutes));
      return;
    }

    setIsSubmitting(true);

    try {
      // The hidden "flow" field tells Convex Auth this is a sign-in, not signup.
      await signIn("password", formData);
      // Success: reset the failed attempt counter (fire-and-forget)
      // Uses .catch to avoid triggering the outer catch block on reset failure
      resetAttempts({ email }).catch(() => {});
      router.push("/dashboard");
    } catch {
      // Record this failed attempt
      await recordFailed({ email });
      // Generic message to avoid leaking whether an email exists
      setError(AUTH_STRINGS.ERR_INVALID_CREDENTIALS);
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

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-error-container/10 border border-error/30 rounded text-error font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
        {/* Hidden field: tells Convex Auth this is a login flow */}
        <input type="hidden" name="flow" value="signIn" />

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
              placeholder={AUTH_STRINGS.PLACEHOLDER_EMAIL} 
              type="email" 
              required 
              onChange={(e) => {
                setLoginEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }} 
            />
          </div>
          {/* Email error — only shown after submit attempt */}
          {fieldErrors.email && (
            <p className="font-body-sm text-xs text-error mt-1">
              {fieldErrors.email}
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
              placeholder={AUTH_STRINGS.PLACEHOLDER_CONFIRM} 
              type={showPassword ? "text" : "password"} 
              required 
              onChange={() => {
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
          {/* Password error — only shown after submit attempt */}
          {fieldErrors.password && (
            <p className="font-body-sm text-xs text-error mt-1">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Submit Button — shows spinner during submission */}
        <button
          className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
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
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-outline-variant/40"></div>
        <span className="font-label-xs text-label-xs text-outline">{AUTH_STRINGS.DIVIDER_TEXT}</span>
        <div className="flex-1 h-px bg-outline-variant/40"></div>
      </div>

      {/* OAuth Buttons — UI only, not wired up yet */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest border border-outline-variant rounded text-on-surface-variant cursor-not-allowed opacity-60 font-label-md text-label-md"
          type="button"
          disabled
          title={AUTH_STRINGS.OAUTH_TOOLTIP}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          {AUTH_STRINGS.BTN_OAUTH_GOOGLE}
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest border border-outline-variant rounded text-on-surface-variant cursor-not-allowed opacity-60 font-label-md text-label-md"
          type="button"
          disabled
          title={AUTH_STRINGS.OAUTH_TOOLTIP}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">ios</span>
          {AUTH_STRINGS.BTN_OAUTH_APPLE}
        </button>
      </div>

      {/* Test Account Info */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <span className="font-label-xs text-label-xs text-outline">{AUTH_STRINGS.TEST_ACCOUNT_HEADER}</span>
        <span className="font-label-xs text-label-xs text-outline">{AUTH_STRINGS.TEST_ACCOUNT_EMAIL}</span>
        <span className="font-label-xs text-label-xs text-outline">{AUTH_STRINGS.TEST_ACCOUNT_PASS}</span>
      </div>
    </div>
  );
}

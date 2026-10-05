// src/components/auth/sign-up-form.tsx
// Sign-up form wired to Clerk custom authentication and verification flow.
"use client";

import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { AUTH_STRINGS } from "@/locale/auth";

export function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // Form states
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verification step state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Field errors on submit
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Auto-complete if returning from OAuth flow
  useEffect(() => {
    if (!isLoaded || !signUp) return;
    if (signUp.status === "complete") {
      void setActive({ session: signUp.createdSessionId }).then(() => {
        router.push("/dashboard");
      });
    }
  }, [isLoaded, signUp, setActive, router]);

  // Reset loading states when navigating back via browser back-forward cache (bfcache)
  useEffect(() => {
    const handlePageShow = () => {
      setIsOAuthLoading(null);
      setIsSubmitting(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setError("");

    // Validation
    const nameError = !name.trim() ? AUTH_STRINGS.ERR_REQ_NAME : undefined;
    const emailError = !email.trim() ? AUTH_STRINGS.ERR_REQ_EMAIL : undefined;
    const pwdError = !password ? AUTH_STRINGS.ERR_REQ_PASSWORD : undefined;
    const confirmPasswordError =
      password !== confirmPassword ? AUTH_STRINGS.ERR_PASSWORDS_MISMATCH : undefined;

    setFieldErrors({
      name: nameError,
      email: emailError,
      password: pwdError,
      confirmPassword: confirmPasswordError,
    });

    if (nameError || emailError || pwdError || confirmPasswordError) return;

    setIsSubmitting(true);

    try {
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || name.trim();
      const lastName = nameParts.slice(1).join(" ") || undefined;

      // Always supply all fields. If an attempt is already active with the same email, update it; otherwise create.
      if (signUp.status === "missing_requirements" && signUp.emailAddress === email.trim()) {
        await signUp.update({
          password,
          firstName,
          lastName,
        });
      } else {
        try {
          await signUp.create({
            emailAddress: email.trim(),
            password,
            firstName,
            lastName,
          });
        } catch (createErr: unknown) {
          // If a sign-up attempt was already initiated in client memory, update it with all fields
          if (signUp.status) {
            await signUp.update({
              emailAddress: email.trim(),
              password,
              firstName,
              lastName,
            });
          } else {
            throw createErr;
          }
        }
      }

      if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
        router.push("/dashboard");
        return;
      }

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
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
      let msg =
        firstErr?.longMessage ||
        firstErr?.message ||
        AUTH_STRINGS.ERR_GENERIC_SIGNUP;

      // Sanitize cryptic Clerk SDK internal errors into human-friendly messages
      if (msg.includes("GET request for this Client") || msg.includes("Sign Up Preparation")) {
        msg = "We couldn't verify this email address. Please check the spelling or try another email.";
      }

      const param = firstErr?.paramName;
      const lower = msg.toLowerCase();

      if (
        param === "email_address" ||
        lower.includes("email") ||
        lower.includes("identifier") ||
        firstErr?.code?.includes("email")
      ) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      } else if (
        param === "password" ||
        lower.includes("password") ||
        firstErr?.code?.includes("password")
      ) {
        setFieldErrors((prev) => ({ ...prev, password: msg }));
      } else if (
        param === "first_name" ||
        param === "last_name" ||
        lower.includes("name")
      ) {
        setFieldErrors((prev) => ({ ...prev, name: msg }));
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setError("");

    if (!code.trim()) {
      setError("Please enter the verification code sent to your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete. Please check the code and try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      const msg =
        clerkErr.errors?.[0]?.longMessage ||
        clerkErr.errors?.[0]?.message ||
        "Verification failed. Please check the code.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signUp || isResending) return;
    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }> };
      setError(clerkErr.errors?.[0]?.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded || !signUp) return;
    setError("");
    setIsOAuthLoading(strategy);

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
        continueSignUp: true,
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message?: string }> };
      setError(clerkErr.errors?.[0]?.message || "Failed to initiate social sign up.");
      setIsOAuthLoading(null);
    }
  };

  // STEP 2: Verification Code View
  if (pendingVerification) {
    return (
      <div className="w-full max-w-md flex flex-col gap-12">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 text-primary mb-8">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
          <span className="font-h2 text-h2 tracking-tight">{AUTH_STRINGS.BRAND_NAME}</span>
        </div>

        <div className="flex flex-col gap-8">
          <button
            type="button"
            onClick={() => setPendingVerification(false)}
            className="flex items-center gap-2 font-label-md text-label-md text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
            Back to edit details
          </button>

          <div className="flex flex-col gap-2">
            <h2 className="font-h2 text-h2 text-on-surface">Verify your email</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              We sent a 6-digit verification code to <span className="font-semibold text-on-surface">{email}</span>.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-error-container/10 border border-error/30 rounded text-error font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded text-primary font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
            <span>A new verification code has been sent.</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="code">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-widest text-2xl font-mono py-3 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded outline-none text-on-surface"
              autoFocus
              required
            />
          </div>

          <button
            className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
                Verifying...
              </>
            ) : (
              <>
                Verify & Continue
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
              </>
            )}
          </button>

          {/* Turnstile Captcha Widget */}
          <div id="clerk-captcha" className="my-2 flex justify-center" />

          <div className="flex items-center justify-center gap-2">
            <span className="text-body-sm text-on-surface-variant font-body-sm">Didn&apos;t receive a code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-primary hover:text-primary-container text-label-md font-label-md disabled:opacity-60 cursor-pointer"
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // STEP 1: Registration Form
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
          <h2 className="font-h2 text-h2 text-on-surface">{AUTH_STRINGS.SIGNUP_TITLE}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{AUTH_STRINGS.SIGNUP_SUBTITLE}</p>
        </div>
        {/* Tabs */}
        <div className="flex p-1 bg-surface-container rounded-lg">
          <Link href="/login" className="flex-1 py-2 text-center rounded text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all">
            {AUTH_STRINGS.TAB_LOGIN}
          </Link>
          <button className="flex-1 py-2 text-center rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-all border border-outline-variant/20">
            {AUTH_STRINGS.TAB_SIGNUP}
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSignUp} className="flex flex-col gap-4" noValidate>
        {/* Full Name Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="name">{AUTH_STRINGS.LABEL_NAME}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">person</span>
            </div>
            <input 
              className={`w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border rounded outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant ${
                fieldErrors.name
                  ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                  : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
              }`} 
              id="name" 
              name="name" 
              value={name}
              placeholder={AUTH_STRINGS.PLACEHOLDER_NAME} 
              type="text" 
              required 
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
          </div>
          {fieldErrors.name && (
            <p className="font-body-sm text-xs text-error mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm shrink-0" aria-hidden="true">error</span>
              <span>{fieldErrors.name}</span>
            </p>
          )}
        </div>

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
            <div className="font-body-sm text-xs text-error mt-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm shrink-0" aria-hidden="true">error</span>
                <span>{fieldErrors.email}</span>
              </span>
              {fieldErrors.email.toLowerCase().includes("taken") && (
                <Link href="/login" className="text-primary hover:underline font-semibold ml-2 shrink-0 inline-flex items-center gap-0.5">
                  Log in <span className="material-symbols-outlined text-xs" aria-hidden="true">arrow_forward</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="password">{AUTH_STRINGS.LABEL_PASSWORD}</label>
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
              placeholder={AUTH_STRINGS.PLACEHOLDER_PASSWORD} 
              type={showPassword ? "text" : "password"} 
              required 
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          <PasswordChecklist password={password} />
          {fieldErrors.password && (
            <p className="font-body-sm text-xs text-error mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">{AUTH_STRINGS.LABEL_CONFIRM_PASSWORD}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">lock</span>
            </div>
            <input 
              className={`w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border rounded outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant ${
                fieldErrors.confirmPassword
                  ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                  : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
              }`} 
              id="confirmPassword" 
              name="confirmPassword" 
              value={confirmPassword}
              placeholder={AUTH_STRINGS.PLACEHOLDER_CONFIRM} 
              type={showConfirmPassword ? "text" : "password"} 
              required 
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">
                {showConfirmPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="font-body-sm text-xs text-error mt-1">{fieldErrors.confirmPassword}</p>
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
          className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          type="submit"
          disabled={isSubmitting || !isLoaded}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
              {AUTH_STRINGS.BTN_SIGNUP_LOADING}
            </>
          ) : (
            <>
              {AUTH_STRINGS.BTN_SIGNUP}
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </>
          )}
        </button>

        {/* Turnstile Captcha Widget rendered directly below button */}
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

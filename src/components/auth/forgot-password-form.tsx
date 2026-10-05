// src/components/auth/forgot-password-form.tsx
// Forgot password flow using Clerk's reset_password_email_code strategy.
"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { AUTH_STRINGS } from "@/locale/auth";

export function ForgotPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError("");

    const emailError = !email.trim() ? AUTH_STRINGS.ERR_REQ_EMAIL : undefined;
    setFieldErrors({ email: emailError });
    if (emailError) return;

    setIsSubmitting(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setStep(2);
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      const msg =
        clerkErr.errors?.[0]?.longMessage ||
        clerkErr.errors?.[0]?.message ||
        "Could not initiate password reset. Please verify your email.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError("");

    const codeError = !code.trim() ? "Reset code is required." : undefined;
    const pwdError = !newPassword ? AUTH_STRINGS.ERR_REQ_PASSWORD : undefined;
    const confirmError =
      newPassword !== confirmPassword ? AUTH_STRINGS.ERR_PASSWORDS_MISMATCH : undefined;

    setFieldErrors({
      code: codeError,
      newPassword: pwdError,
      confirmPassword: confirmError,
    });

    if (codeError || pwdError || confirmError) return;

    setIsSubmitting(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Further verification required. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
      const msg =
        clerkErr.errors?.[0]?.longMessage ||
        clerkErr.errors?.[0]?.message ||
        "Failed to reset password. Please verify the code and try again.";
      setError(msg);
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
        <Link
          href="/login"
          className="flex items-center gap-2 font-label-md text-label-md text-outline hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_back</span>
          {AUTH_STRINGS.LINK_BACK_TO_LOGIN}
        </Link>

        <div className="flex flex-col gap-2">
          <h2 className="font-h2 text-h2 text-on-surface">
            {step === 1 ? AUTH_STRINGS.FORGOT_PASSWORD_TITLE : "Set new password"}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {step === 1
              ? AUTH_STRINGS.FORGOT_PASSWORD_SUBTITLE
              : `Enter the code sent to ${email} and choose a new password.`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-error-container/10 border border-error/30 rounded text-error font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
          <span>{error}</span>
        </div>
      )}

      {step === 1 ? (
        /* STEP 1: Enter email */
        <form onSubmit={handleRequestCode} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
              {AUTH_STRINGS.LABEL_EMAIL}
            </label>
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
                value={email}
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
            </div>
            {fieldErrors.email && (
              <p className="font-body-sm text-xs text-error mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <button
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            type="submit"
            disabled={isSubmitting || !isLoaded}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
                Sending reset code...
              </>
            ) : (
              <>
                Send Reset Code
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
              </>
            )}
          </button>

          {/* Turnstile Captcha Widget */}
          <div id="clerk-captcha" className="my-2 flex justify-center" />
        </form>
      ) : (
        /* STEP 2: Enter code & new password */
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4" noValidate>
          {/* Code */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="code">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: undefined }));
              }}
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded outline-none text-on-surface"
              required
            />
            {fieldErrors.code && (
              <p className="font-body-sm text-xs text-error mt-1">{fieldErrors.code}</p>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                className="w-full pl-4 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded outline-none text-on-surface"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
            <PasswordChecklist password={newPassword} />
            {fieldErrors.newPassword && (
              <p className="font-body-sm text-xs text-error mt-1">{fieldErrors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className="w-full pl-4 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded outline-none text-on-surface"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface cursor-pointer"
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

          <button
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            type="submit"
            disabled={isSubmitting || !isLoaded}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">progress_activity</span>
                Resetting password...
              </>
            ) : (
              <>
                Reset Password & Log In
                <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
              </>
            )}
          </button>

          {/* Turnstile Captcha Widget */}
          <div id="clerk-captcha" className="my-2 flex justify-center" />
        </form>
      )}
    </div>
  );
}

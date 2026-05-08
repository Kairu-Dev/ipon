// src/components/auth/sign-up-form.tsx
// Sign-up form wired to Convex Auth Password provider.
// Design is preserved exactly — only the auth logic has changed.
"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { signUpSchema } from "@/lib/validation";
import { AUTH_STRINGS } from "@/constants/auth";

export function SignUpForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Tracked for real-time inline validation (controlled inputs)
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // On-submit validation: errors only appear after user clicks "Create Account"
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const confirmPassword = formData.get("confirmPassword") as string;

    // 1. Validate with Zod to catch name/email errors.
    // We run the full schema but only extract name/email errors for the UI.
    // Password errors are NOT shown here — the real-time PasswordChecklist
    // guides the user, and the server's validatePasswordRequirements blocks weak passwords.
    const result = signUpSchema.safeParse({ name, email, password });
    const flatErrors = !result.success
      ? result.error.flatten().fieldErrors
      : {};
    const nameError = flatErrors.name?.[0];
    const emailError = flatErrors.email?.[0];

    const confirmPasswordError = password !== confirmPassword ? AUTH_STRINGS.ERR_PASSWORDS_MISMATCH : undefined;
    const pwdError = !password ? AUTH_STRINGS.ERR_REQ_PASSWORD : undefined;

    setFieldErrors({ name: nameError, email: emailError, password: pwdError, confirmPassword: confirmPasswordError });

    // Block submission if any field has an error
    if (nameError || emailError || pwdError || confirmPasswordError) return;

    setIsSubmitting(true);
    try {
      // The hidden "flow" field tells Convex Auth this is a sign-up, not login.
      // The "name" field is passed to the users table via profile() in auth.ts.
      await signIn("password", formData);
      router.push("/dashboard");
    } catch {
      // Generic message to prevent user enumeration
      // (do not reveal whether the email is already registered)
      setError(AUTH_STRINGS.ERR_GENERIC_SIGNUP);
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

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-error-container/10 border border-error/30 rounded text-error font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSignUp} className="flex flex-col gap-4" noValidate>
        {/* Hidden field: tells Convex Auth this is a signup flow */}
        <input type="hidden" name="flow" value="signUp" />

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
              placeholder={AUTH_STRINGS.PLACEHOLDER_NAME}
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Clear error as user types after a failed submit
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
          </div>
          {/* Name error — only shown after submit attempt */}
          {fieldErrors.name && (
            <p className="font-body-sm text-xs text-error mt-1">
              {fieldErrors.name}
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
              placeholder={AUTH_STRINGS.PLACEHOLDER_EMAIL}
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear error as user types after a failed submit
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
              placeholder={AUTH_STRINGS.PLACEHOLDER_PASSWORD} 
              type={showPassword ? "text" : "password"} 
              required 
              value={password} 
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
          <PasswordChecklist password={password} />
          {/* Password error — only shown after submit attempt if empty */}
          {fieldErrors.password && (
            <p className="font-body-sm text-xs text-error mt-1">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm-password">{AUTH_STRINGS.LABEL_CONFIRM_PASSWORD}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <input 
              className={`w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border rounded outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant ${
                fieldErrors.confirmPassword
                  ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                  : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary"
              }`} 
              id="confirm-password" 
              name="confirmPassword" 
              placeholder={AUTH_STRINGS.PLACEHOLDER_CONFIRM} 
              type={showConfirmPassword ? "text" : "password"} 
              required 
              onChange={() => {
                if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              <span className="material-symbols-outlined text-xl">
                {showConfirmPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {/* Confirm Password error — only shown after submit attempt */}
          {fieldErrors.confirmPassword && (
            <p className="font-body-sm text-xs text-error mt-1">
              {fieldErrors.confirmPassword}
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
              {AUTH_STRINGS.BTN_SIGNUP_LOADING}
            </>
          ) : (
            <>
              {AUTH_STRINGS.BTN_SIGNUP}
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
    </div>
  );
}

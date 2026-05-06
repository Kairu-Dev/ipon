"use client";
import { useUIStore } from "@/store/ui-store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const setLoggedIn = useUIStore((s) => s.setLoggedIn);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-12">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-2 text-primary mb-8">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
        <span className="font-h2 text-h2 tracking-tight">Ipon</span>
      </div>

      {/* Form Header & Toggle */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-h2 text-h2 text-on-surface">Welcome back</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Enter your details below to securely log in.</p>
        </div>
        {/* Tabs */}
        <div className="flex p-1 bg-surface-container rounded-lg">
          <button className="flex-1 py-2 text-center rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-all border border-outline-variant/20">
            Log In
          </button>
          <Link href="/sign-up" className="flex-1 py-2 text-center rounded text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">mail</span>
            </div>
            <input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant" id="email" placeholder="name@example.com" type="email" required />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
            <a className="font-label-xs text-label-xs text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">lock</span>
            </div>
            <input className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant" id="password" placeholder="••••••••" type="password" required />
            <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors" type="button">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">visibility_off</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2" type="submit">
          Sign In
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-outline-variant/40"></div>
        <span className="font-label-xs text-label-xs text-outline">Or continue with</span>
        <div className="flex-1 h-px bg-outline-variant/40"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest border border-outline-variant rounded text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md" type="button">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Google
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-surface-container-lowest border border-outline-variant rounded text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md" type="button">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">ios</span>
          Apple
        </button>
      </div>
    </div>
  );
}

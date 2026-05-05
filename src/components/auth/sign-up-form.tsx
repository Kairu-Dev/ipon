"use client";
import { useUIStore } from "@/store/ui-store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignUpForm() {
  const setLoggedIn = useUIStore((s) => s.setLoggedIn);
  const router = useRouter();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy authentication
    setLoggedIn(true);
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-12">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-2 text-primary mb-8">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
        <span className="font-h2 text-h2 tracking-tight">Ipon</span>
      </div>

      {/* Form Header & Toggle */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-h2 text-h2 text-on-surface">Create your account</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Start your savings journey today.</p>
        </div>
        {/* Tabs */}
        <div className="flex p-1 bg-surface-container rounded-lg">
          <Link href="/login" className="flex-1 py-2 text-center rounded text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all">
            Log In
          </Link>
          <button className="flex-1 py-2 text-center rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm transition-all border border-outline-variant/20">
            Sign Up
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        {/* Full Name Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="name">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant" id="name" placeholder="John Doe" type="text" required />
          </div>
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl">mail</span>
            </div>
            <input className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant" id="email" placeholder="name@example.com" type="email" required />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <input className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant" id="password" placeholder="••••••••" type="password" required />
            <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors" type="button">
              <span className="material-symbols-outlined text-xl">visibility_off</span>
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm-password">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <input className="w-full pl-10 pr-10 py-2.5 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-base text-body-base text-on-surface placeholder:text-outline-variant" id="confirm-password" placeholder="••••••••" type="password" required />
            <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors" type="button">
              <span className="material-symbols-outlined text-xl">visibility_off</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button className="w-full mt-2 py-3 bg-primary hover:bg-primary-container text-on-primary rounded font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2" type="submit">
          Create Account
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </form>
    </div>
  );
}

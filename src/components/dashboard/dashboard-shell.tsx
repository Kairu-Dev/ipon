"use client";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if session expires mid-use.
  // proxy.ts handles unauthenticated page loads on the server side.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a branded skeleton while auth state resolves.
  // This fires exactly once per page load — no re-render concern.
  if (isLoading) {
    return (
      <div className="bg-background text-on-background font-body-base h-screen overflow-hidden flex">
        {/* Skeleton sidebar */}
        <div className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col p-4">
          <div className="mb-8 px-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold">I</div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-500 font-h2">Ipon</div>
              <div className="text-slate-500 text-xs font-label-xs">Financial Growth</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        {/* Skeleton main content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold animate-pulse">I</div>
          <p className="text-sm text-slate-400 animate-pulse">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — render nothing, useEffect will redirect
  if (!isAuthenticated) return null;

  return (
    <div className="bg-background text-on-background font-body-base h-screen overflow-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 border-b z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 hidden md:flex justify-between items-center px-8">
        <div className="hidden text-green-600 dark:text-green-500 font-manrope text-sm font-semibold">Ipon</div>
        <div className="flex-1 flex justify-start">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-slate-200 rounded-full text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Search..." type="text" aria-label="Search"/>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwte5fih0oaheTK_OB0sx3yBM879Nd8qfOBZwRMV_y0--lpi3jB9jq1GqunUMI4bZPxW7C6DDoBteDf3xRplCC1WxWkZkXuSgeg4DEdHWsBmjUho1A-KmXgl9dXkXR3xmBJrmIqPfolp36IEEM6irBKAReQ60HBUeaGVvl_l6rJTAhlyKf9gQ-4VkSZ7MZSBb5diHb_i4qg2j3NluAVXSLjRmDkt_PlfrM4aQH1uV5fUApiAMq69KylBwssAAdF6H58xN32PpQqat7"/>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <nav className="h-screen w-64 border-r fixed left-0 top-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hidden md:flex flex-col p-4 z-50">
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold">I</div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-500 font-h2">Ipon</div>
            <div className="text-slate-500 text-xs font-label-xs">Financial Growth</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 font-manrope antialiased text-sm font-medium">
          <Link href="/dashboard" className={`${pathname === '/dashboard' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} rounded-lg px-4 py-2 flex items-center gap-3 transition-all active:scale-95 duration-150 ease-in-out`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard' ? "'FILL' 1" : "" }} aria-hidden="true">dashboard</span>
            Dashboard
          </Link>
          <Link href="/dashboard/transactions" className={`${pathname === '/dashboard/transactions' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} rounded-lg px-4 py-2 flex items-center gap-3 transition-all active:scale-95 duration-150 ease-in-out`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/transactions' ? "'FILL' 1" : "" }} aria-hidden="true">receipt_long</span>
            Transactions
          </Link>
          <Link href="/dashboard/savings-goals" className={`${pathname === '/dashboard/savings-goals' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} rounded-lg px-4 py-2 flex items-center gap-3 transition-all active:scale-95 duration-150 ease-in-out`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/savings-goals' ? "'FILL' 1" : "" }} aria-hidden="true">savings</span>
            Savings Goals
          </Link>
          <Link href="/dashboard/budget" className={`${pathname === '/dashboard/budget' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} rounded-lg px-4 py-2 flex items-center gap-3 transition-all active:scale-95 duration-150 ease-in-out`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/budget' ? "'FILL' 1" : "" }} aria-hidden="true">account_balance_wallet</span>
            Budget
          </Link>
          <Link href="/dashboard/chat" className={`${pathname === '/dashboard/chat' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} rounded-lg px-4 py-2 flex items-center gap-3 transition-all active:scale-95 duration-150 ease-in-out`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/chat' ? "'FILL' 1" : "" }} aria-hidden="true">chat</span>
            Chat
          </Link>
        </div>
        <div className="mt-auto flex flex-col gap-2 font-manrope antialiased text-sm font-medium border-t border-slate-200 pt-4">
          <Link href="/dashboard/settings" className="text-slate-600 dark:text-slate-400 px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-150 ease-in-out">
            <span className="material-symbols-outlined" aria-hidden="true">settings</span>
            Settings
          </Link>
          <button onClick={() => void signOut()} className="text-slate-600 dark:text-slate-400 px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-150 ease-in-out w-full text-left">
            <span className="material-symbols-outlined" aria-hidden="true">logout</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-4 md:pt-20 px-4 md:px-8 pb-24 md:pb-8 h-full overflow-y-auto max-w-[1280px] mx-auto space-y-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/dashboard" className={`flex flex-col items-center ${pathname === '/dashboard' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'} gap-1`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard' ? "'FILL' 1" : "" }} aria-hidden="true">dashboard</span>
          <span className="font-label-xs text-[10px]">Dashboard</span>
        </Link>
        <Link href="/dashboard/transactions" className={`flex flex-col items-center ${pathname === '/dashboard/transactions' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'} gap-1`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/transactions' ? "'FILL' 1" : "" }} aria-hidden="true">receipt_long</span>
          <span className="font-label-xs text-[10px]">Transactions</span>
        </Link>
        <div className="relative -top-6">
          <button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">add</span>
          </button>
        </div>
        <Link href="/dashboard/budget" className={`flex flex-col items-center ${pathname === '/dashboard/budget' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'} gap-1`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/budget' ? "'FILL' 1" : "" }} aria-hidden="true">account_balance_wallet</span>
          <span className="font-label-xs text-[10px]">Budget</span>
        </Link>
        <Link href="/dashboard/settings" className={`flex flex-col items-center ${pathname === '/dashboard/settings' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'} gap-1`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/settings' ? "'FILL' 1" : "" }} aria-hidden="true">person</span>
          <span className="font-label-xs text-[10px]">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

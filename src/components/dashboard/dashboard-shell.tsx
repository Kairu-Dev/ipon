"use client";
import { useConvexAuth } from "convex/react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { AddTransactionModal } from "@/components/transactions";
import { useEnsureUser } from "@/hooks/use-ensure-user";
import { UserProfileMenu } from "@/components/dashboard/user-profile-menu";
import { NotificationCenter } from "@/components/dashboard/notification-center";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isLoaded: isClerkLoaded = true, isSignedIn = false } = useAuth();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const { isReady } = useEnsureUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const setAddTransactionModalOpen = useUIStore((s) => s.setAddTransactionModalOpen);

  // Still resolving auth state:
  // - Clerk hasn't initialized yet
  // - Convex is loading
  // - User is signed in to Clerk, but Convex token is still exchanging or user record is syncing
  const isResolving =
    !isClerkLoaded ||
    isConvexLoading ||
    (isSignedIn && (!isAuthenticated || !isReady)) ||
    (!isSignedIn && isConvexLoading);

  // Redirect to login ONLY if Clerk has fully loaded and confirmed user is NOT signed in
  useEffect(() => {
    if (isClerkLoaded && !isSignedIn && !isConvexLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isClerkLoaded, isSignedIn, isConvexLoading, isAuthenticated, router]);

  // Show a modern, non-blocking shell skeleton while auth state resolves
  if (isResolving) {
    return (
      <div className="bg-background text-on-background font-body-base h-screen overflow-hidden flex">
        {/* Hairline Top Progress Pulse */}
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary w-2/5 animate-pulse" />
        </div>

        {/* Skeleton sidebar (matches actual layout) */}
        <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col p-4 shrink-0">
          <div className="mb-8 px-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-500 font-h2">Ipon</div>
              <div className="text-slate-500 text-xs font-label-xs">Financial Growth</div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Skeleton main canvas (previews layout without blocking) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* TopBar outline */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-800 hidden md:flex items-center justify-end px-8 bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
            </div>
          </div>

          {/* Canvas content skeleton */}
          <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-[1280px] w-full mx-auto">
            {/* Header placeholder */}
            <div className="space-y-2">
              <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <p className="sr-only">Loading your dashboard…</p>
              <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </div>

            {/* 3 Metric Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/60 rounded" />
                  <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
                </div>
              ))}
            </div>

            {/* Content Table / Chart Preview Skeleton */}
            <div className="h-72 bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  // Not authenticated — keep background styled with subtle spinner while redirect executes
  if (!isAuthenticated && !isSignedIn) {
    return (
      <div className="bg-background text-on-background font-body-base h-screen overflow-hidden flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-base h-screen overflow-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 border-b z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 hidden md:flex justify-end items-center px-8">
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <UserProfileMenu />
        </div>
      </header>

      {/* SideNavBar */}
      <nav className="h-screen w-64 border-r fixed left-0 top-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hidden md:flex flex-col p-4 z-50">
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">spa</span>
          </div>
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
          <button onClick={() => void signOut({ redirectUrl: "/login" })} className="text-slate-600 dark:text-slate-400 px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-150 ease-in-out w-full text-left">
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
          <button 
            onClick={() => setAddTransactionModalOpen(true)}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">add</span>
          </button>
        </div>
        <Link href="/dashboard/budget" className={`flex flex-col items-center ${pathname === '/dashboard/budget' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'} gap-1`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/budget' ? "'FILL' 1" : "" }} aria-hidden="true">account_balance_wallet</span>
          <span className="font-label-xs text-[10px]">Budget</span>
        </Link>
        <Link href="/dashboard/chat" className={`flex flex-col items-center ${pathname === '/dashboard/chat' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'} gap-1`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/dashboard/chat' ? "'FILL' 1" : "" }} aria-hidden="true">chat</span>
          <span className="font-label-xs text-[10px]">Chat</span>
        </Link>
      </nav>

      {/* Global Modals */}
      <AddTransactionModal />
    </div>
  );
}

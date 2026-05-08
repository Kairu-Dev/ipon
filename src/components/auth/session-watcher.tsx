// src/components/auth/session-watcher.tsx
// Layer 2 of the two-layer route protection system.
// Detects mid-session expiry while the user is actively using the app.
// Layer 1 (proxy.ts) handles unauthenticated page loads on the server.
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useUIStore } from "@/store/ui-store";

export function SessionWatcher() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const clearStore = useUIStore((state) => state.clearStore);

  useEffect(() => {
    // Only act when auth state is resolved (not loading) and session is gone
    if (!isLoading && !isAuthenticated && pathname.startsWith("/dashboard")) {
      clearStore();
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router, clearStore]);

  // This component renders nothing — it's purely a side-effect watcher
  return null;
}

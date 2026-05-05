"use client";
import { useUIStore } from "@/store/ui-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useUIStore((s) => s.isLoggedIn);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/login");
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b flex justify-between items-center bg-card">
        <h1 className="text-xl font-bold text-primary">Ipon Dashboard</h1>
        <Button variant="ghost" onClick={() => useUIStore.getState().setLoggedIn(false)}>Logout</Button>
      </header>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/store/ui-store";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const setLoggedIn = useUIStore((s) => s.setLoggedIn);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto p-6 border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold">Login</h1>
      <Input type="email" placeholder="Email" required />
      <Input type="password" placeholder="Password" required />
      <Button type="submit">Sign In</Button>
    </form>
  );
}

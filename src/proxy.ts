// src/proxy.ts
// Next.js 16 route protection layer (renamed from middleware.ts).
// Uses Clerk to check session state before page loads.
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const AUTH_PATHS = ["/login", "/sign-up", "/forgot-password", "/sso-callback"];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId } = await auth();

  const isAuthRoute = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isProtectedRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  // Already logged in → redirect away from auth pages to dashboard
  if (userId && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Not logged in → redirect to login page for protected routes
  if (!userId && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

// Matcher: run on all routes except static files and Next.js internals
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

// src/proxy.ts
// Next.js 16 route protection layer (renamed from middleware.ts).
// Uses Convex Auth to check session cookies on the server before page loads.
// See Standards/nextjs-conventions.md for the two-layer protection system.
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Route groups: (auth) creates a layout group but the URL stays /login, /sign-up
const isAuthPage = createRouteMatcher(["/login", "/sign-up"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// convexAuthNextjsMiddleware returns a NextMiddleware function.
// Next.js 16 proxy.ts supports export default.
export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // Already logged in → redirect away from auth pages to dashboard
    if (isAuthPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }
    // Not logged in → redirect to login page
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
  },
  // Session cookie persists for 30 days (not deleted on browser close)
  { cookieConfig: { maxAge: 60 * 60 * 24 * 30 } },
);

// Matcher: run on all routes except static files and Next.js internals
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

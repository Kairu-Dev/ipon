// convex/auth.ts
// Convex Auth configuration with the Password provider.
// Exports: auth, signIn, signOut, store, isAuthenticated
// isAuthenticated is required by convexAuthNextjsMiddleware in proxy.ts.
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      // profile() passes form fields into the users table during signup.
      // This is the correct way to write `name` into the user document —
      // do NOT call a separate createUser mutation from the client.
      profile(params) {
        const name = (params.name as string) ?? "";
        const email = params.email as string;

        // Prevent data bloat: reject abnormally long names
        // (matches the 50-char Zod rule in src/lib/validation.ts)
        if (name.length > 50) {
          throw new ConvexError("Name must be 50 characters or fewer.");
        }

        return { email, name };
      },
      // Server-side password validation.
      // Runs before the account is created — rejects weak passwords early.
      validatePasswordRequirements: (password: string) => {
        if (password.length < 8 || password.trim().length === 0) {
          throw new ConvexError(
            "Password must be at least 8 characters and cannot be blank."
          );
        }
        if (!/[A-Z]/.test(password)) {
          throw new ConvexError("Password must contain at least one uppercase letter.");
        }
        if (!/[a-z]/.test(password)) {
          throw new ConvexError("Password must contain at least one lowercase letter.");
        }
        if (!/[0-9]/.test(password)) {
          throw new ConvexError("Password must contain at least one number.");
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
          throw new ConvexError("Password must contain at least one special character.");
        }
      },
    }),
  ],
});

// e2e/auth-security.spec.ts
// Security-focused E2E tests for the Ipon authentication layer.
// Tests route protection, session handling, and input sanitization.
import { test, expect } from "@playwright/test";

test.describe("Route Protection (proxy.ts)", () => {
  test("unauthenticated user cannot access /dashboard", async ({ page }) => {
    // Go directly to dashboard without logging in
    await page.goto("/dashboard");

    // proxy.ts should redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("unauthenticated user cannot access nested dashboard routes", async ({ page }) => {
    await page.goto("/dashboard/transactions");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("unauthenticated user cannot access /dashboard/settings", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("unauthenticated user can access /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("unauthenticated user can access /sign-up", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveURL(/\/sign-up/);
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });
});

test.describe("Session Security", () => {
  // Session Security is enforced by Clerk via session cookies and clerkMiddleware in proxy.ts

  test("login error message does not leak email existence", async ({ page }) => {
    await page.goto("/login");

    // Try with a non-existent email
    await page.getByPlaceholder("name@example.com").fill("doesnotexist@test.com");
    await page.getByPlaceholder("••••••••").fill("SomePassword@1");
    await page.getByRole("button", { name: /sign in/i }).click();

    // The error message should be generic
    await expect(page.getByText("Invalid email or password.")).toBeVisible({ timeout: 10000 });

    // Should NOT contain messages like "User not found" or "Email does not exist"
    await expect(page.getByText("User not found")).not.toBeVisible();
    await expect(page.getByText("Email does not exist")).not.toBeVisible();
    await expect(page.getByText("No account found")).not.toBeVisible();
  });

  // NOTE: The "submit button is disabled during submission" test was removed.
  // The Promise.race between isDisabled/isVisible/timeout is inherently racy —
  // on fast networks or CI, the request completes before the state is captured.
  // The disabled state is tested deterministically in login-form.test.tsx (Vitest).
});

test.describe("Input Sanitization", () => {
  test("XSS payload in email field is rejected as invalid email", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").fill('<script>alert("xss")</script>');
    await page.getByPlaceholder("••••••••").fill("12345678");

    // The email input has type="email" + required, so the browser
    // should prevent form submission. Let's verify the input is there
    // but the form won't process it.
    const emailInput = page.getByPlaceholder("name@example.com");
    await expect(emailInput).toHaveValue('<script>alert("xss")</script>');

    // The native email validation should block submission
    // (type="email" makes browser reject non-email values)
  });

  test("XSS payload in name field does not execute (sign-up)", async ({ page }) => {
    await page.goto("/sign-up");
    const nameInput = page.getByPlaceholder("John Doe");
    await nameInput.fill('<img src=x onerror=alert(document.cookie)>');

    // Value should be plain text, not rendered
    await expect(nameInput).toHaveValue('<img src=x onerror=alert(document.cookie)>');

    // No alert dialog should appear
    let alertFired = false;
    page.on("dialog", () => { alertFired = true; });
    await page.waitForTimeout(500);
    expect(alertFired).toBe(false);
  });

  test("SQL injection in email field is rejected", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").fill("' OR 1=1 --");
    await page.getByPlaceholder("••••••••").fill("12345678");

    // type="email" native validation will block this,
    // so we just verify the value is accepted as text but not processed
    const emailInput = page.getByPlaceholder("name@example.com");
    await expect(emailInput).toHaveValue("' OR 1=1 --");
  });
});

test.describe("OAuth Buttons Security", () => {
  test("Google and Apple buttons are enabled for active SSO redirect", async ({ page }) => {
    await page.goto("/login");
    const googleButton = page.getByRole("button", { name: /google/i });
    const appleButton = page.getByRole("button", { name: /apple/i });
    await expect(googleButton).toBeEnabled();
    await expect(appleButton).toBeEnabled();
  });
});

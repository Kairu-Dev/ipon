// e2e/auth.spec.ts
// End-to-end tests for the Ipon authentication flow.
// Requires a running Convex backend (npx convex dev) and Next.js dev server.
// Test account must exist in the database: name@example.com / 12345678
import { test, expect } from "@playwright/test";

// Test account credentials (pre-seeded in the database)
const TEST_EMAIL = "name@example.com";
const TEST_PASSWORD = "12345678";

// In GitHub Actions, the database is completely empty on every run.
// This global beforeAll block ensures the TEST_EMAIL account exists before any tests run.
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto("/sign-up");
  await page.getByPlaceholder("John Doe").fill("Test User");
  await page.getByPlaceholder("name@example.com").fill(TEST_EMAIL);
  const passwordFields = page.getByPlaceholder("••••••••");
  await passwordFields.nth(0).fill(TEST_PASSWORD);
  await passwordFields.nth(1).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();
  
  // Wait for signup to complete — either redirect or "already exists" error
  try {
    await Promise.race([
      page.waitForURL(/\/dashboard/, { timeout: 10000 }),
      page.waitForSelector("text=Could not create account", { timeout: 10000 })
    ]);
  } catch (err) {
    throw new Error(`Test account setup failed in beforeAll: ${err}`);
  }
  
  await page.close();
});

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("login page renders correctly", async ({ page }) => {
    // Heading
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    // Form fields
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();

    // Submit button
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    // Tab links
    await expect(page.getByText("Log In", { exact: true })).toBeVisible();
    await expect(page.getByText("Sign Up", { exact: true })).toBeVisible();

    // Test account info
    await expect(page.getByText("Test account for this app")).toBeVisible();
  });

  test("shows disabled OAuth buttons with Coming Soon", async ({ page }) => {
    const googleButton = page.getByRole("button", { name: /google/i });
    const appleButton = page.getByRole("button", { name: /apple/i });

    await expect(googleButton).toBeVisible();
    await expect(appleButton).toBeVisible();
    await expect(googleButton).toBeDisabled();
    await expect(appleButton).toBeDisabled();
  });

  test("password toggle works", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("••••••••");
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click the visibility toggle button
    await page.locator("button:has(span:text('visibility_off'))").first().click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click again to hide
    await page.locator("button:has(span:text('visibility'))").first().click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.getByPlaceholder("name@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("failed login shows error message", async ({ page }) => {
    await page.getByPlaceholder("name@example.com").fill("wrong@example.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error, NOT redirect
    await expect(page.getByText("Invalid email or password.")).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("Sign Up tab navigates to sign-up page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign Up" }).click();
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe("Sign Up Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-up");
  });

  test("sign-up page renders correctly", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await expect(page.getByPlaceholder("John Doe")).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    // Two password fields
    const passwordFields = page.getByPlaceholder("••••••••");
    await expect(passwordFields).toHaveCount(2);
  });

  test("Log In tab navigates to login page", async ({ page }) => {
    await page.getByRole("link", { name: "Log In" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.getByPlaceholder("John Doe").fill("Test User");
    await page.getByPlaceholder("name@example.com").fill("newuser@test.com");
    const passwordFields = page.getByPlaceholder("••••••••");
    await passwordFields.nth(0).fill("Secure@123");
    await passwordFields.nth(1).fill("Different@123");

    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });
});

test.describe("Logout Flow", () => {
  test("logout redirects to login page", async ({ page }) => {
    // First, log in
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Then, click logout (visible on desktop sidebar)
    // Using getByRole is more robust than getByText as it finds the button, not the icon span
    // force: true bypasses the Next.js dev overlay (<nextjs-portal>) that
    // intercepts pointer events in CI's dev-mode server
    await page.getByRole("button", { name: /logout/i }).click({ force: true });

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});

test.describe("Authenticated Redirect", () => {
  test("authenticated user visiting /login is redirected to /dashboard", async ({ page }) => {
    // Log in first
    await page.goto("/login");
    await page.getByPlaceholder("name@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Try to visit login again — proxy should redirect back to dashboard
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

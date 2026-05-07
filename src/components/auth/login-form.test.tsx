// src/components/auth/login-form.test.tsx
// Unit tests for the Login form component.
// Mocks Convex Auth and Next.js navigation to test form behavior in isolation.
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock signIn from Convex Auth
const mockSignIn = vi.fn();
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: mockSignIn }),
}));

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---
  it("renders email and password inputs", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText("name@example.com")).toBeDefined();
    expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
  });

  it("renders the submit button with 'Sign In' text", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  });

  it("renders the heading", () => {
    render(<LoginForm />);
    expect(screen.getByText("Welcome back")).toBeDefined();
  });

  it("renders the Sign Up tab as a link to /sign-up", () => {
    render(<LoginForm />);
    const signUpLink = screen.getByText("Sign Up");
    expect(signUpLink.closest("a")).toBeDefined();
    expect(signUpLink.closest("a")?.getAttribute("href")).toBe("/sign-up");
  });

  it("renders test account info", () => {
    render(<LoginForm />);
    expect(screen.getByText("Test account for this app")).toBeDefined();
    expect(screen.getByText("Email: name@example.com")).toBeDefined();
    expect(screen.getByText("Password: 12345678")).toBeDefined();
  });

  // --- Password visibility toggle ---
  it("toggles password visibility when eye icon is clicked", async () => {
    render(<LoginForm />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    // Initially type=password
    expect(passwordInput.getAttribute("type")).toBe("password");

    // Find the toggle button (the one inside the password field)
    const toggleButtons = screen.getAllByRole("button");
    // The toggle is the one that is NOT the submit button and NOT a tab
    const toggleButton = toggleButtons.find(
      (btn) => btn.querySelector(".material-symbols-outlined")?.textContent === "visibility_off"
    );
    expect(toggleButton).toBeDefined();

    await userEvent.click(toggleButton!);
    expect(passwordInput.getAttribute("type")).toBe("text");

    await userEvent.click(toggleButton!);
    expect(passwordInput.getAttribute("type")).toBe("password");
  });

  // --- OAuth buttons ---
  it("renders disabled Google and Apple buttons with 'Coming soon'", () => {
    render(<LoginForm />);
    const googleBtn = screen.getByText(/google — coming soon/i).closest("button");
    const appleBtn = screen.getByText(/apple — coming soon/i).closest("button");
    expect(googleBtn).toBeDefined();
    expect(appleBtn).toBeDefined();
    expect(googleBtn?.hasAttribute("disabled")).toBe(true);
    expect(appleBtn?.hasAttribute("disabled")).toBe(true);
  });

  // --- Form submission ---
  it("calls signIn with password provider and redirects on success", async () => {
    mockSignIn.mockResolvedValueOnce({});
    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "name@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "12345678");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    // Wait for async signIn to complete
    await vi.waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    // Verify signIn was called with "password" and a FormData instance
    expect(mockSignIn).toHaveBeenCalledWith("password", expect.any(FormData));

    // Verify redirect to dashboard
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error message on failed login", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "wrong@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    // Should show generic error (not leaking whether email exists)
    await vi.waitFor(() => {
      expect(screen.getByText("Invalid email or password.")).toBeDefined();
    });

    // Should NOT redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Hidden flow field ---
  it("includes hidden flow=signIn field in form", () => {
    render(<LoginForm />);
    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    const hiddenInput = form.querySelector('input[name="flow"]') as HTMLInputElement;
    expect(hiddenInput).toBeDefined();
    expect(hiddenInput.value).toBe("signIn");
    expect(hiddenInput.type).toBe("hidden");
  });

  // --- Security: error message does not leak email existence ---
  it("shows generic error message regardless of failure reason", async () => {
    // Simulate different error types — all should produce the same message
    mockSignIn.mockRejectedValueOnce(new Error("User not found"));
    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "test@test.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "test");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      // Should always say "Invalid email or password." — never "User not found"
      expect(screen.getByText("Invalid email or password.")).toBeDefined();
      expect(screen.queryByText("User not found")).toBeNull();
    });
  });
});

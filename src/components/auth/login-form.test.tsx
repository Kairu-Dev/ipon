// src/components/auth/login-form.test.tsx
// Unit tests for the LoginForm component.
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk useSignIn
const mockSignInCreate = vi.fn();
const mockAuthenticateWithRedirect = vi.fn();
const mockSetActive = vi.fn();

vi.mock("@clerk/nextjs/legacy", () => ({
  useSignIn: () => ({
    isLoaded: true,
    signIn: {
      create: mockSignInCreate,
      authenticateWithRedirect: mockAuthenticateWithRedirect,
    },
    setActive: mockSetActive,
  }),
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

  it("toggles password visibility when eye icon is clicked", async () => {
    render(<LoginForm />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput.getAttribute("type")).toBe("password");

    const toggleButton = screen.getByRole("button", { name: /show password|hide password/i });
    await userEvent.click(toggleButton);
    expect(passwordInput.getAttribute("type")).toBe("text");

    await userEvent.click(toggleButton);
    expect(passwordInput.getAttribute("type")).toBe("password");
  });

  it("renders active Google and Apple SSO buttons", () => {
    render(<LoginForm />);
    const googleBtn = screen.getByRole("button", { name: /google/i });
    const appleBtn = screen.getByRole("button", { name: /apple/i });
    expect(googleBtn).toBeDefined();
    expect(appleBtn).toBeDefined();
    expect(googleBtn.hasAttribute("disabled")).toBe(false);
    expect(appleBtn.hasAttribute("disabled")).toBe(false);
  });

  it("triggers OAuth redirect when clicking Google button", async () => {
    render(<LoginForm />);
    const googleBtn = screen.getByRole("button", { name: /google/i });
    await userEvent.click(googleBtn);

    expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/dashboard",
      continueSignUp: true,
    });
  });

  it("calls Clerk signIn.create and sets active session on success", async () => {
    mockSignInCreate.mockResolvedValueOnce({
      status: "complete",
      createdSessionId: "sess_12345",
    });
    mockSetActive.mockResolvedValueOnce(undefined);

    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Pass1234!");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "user@example.com",
        password: "Pass1234!",
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: "sess_12345" });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error message on failed login", async () => {
    mockSignInCreate.mockRejectedValueOnce({
      errors: [{ message: "Invalid email or password" }],
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "wrong@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeDefined();
    });
  });
});

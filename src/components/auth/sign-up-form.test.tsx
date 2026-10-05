// src/components/auth/sign-up-form.test.tsx
// Unit tests for the SignUpForm component.
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "./sign-up-form";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Clerk useSignUp
const mockSignUpCreate = vi.fn();
const mockPrepareEmailAddressVerification = vi.fn();
const mockAttemptEmailAddressVerification = vi.fn();
const mockAuthenticateWithRedirect = vi.fn();
const mockSetActive = vi.fn();

vi.mock("@clerk/nextjs/legacy", () => ({
  useSignUp: () => ({
    isLoaded: true,
    signUp: {
      create: mockSignUpCreate,
      prepareEmailAddressVerification: mockPrepareEmailAddressVerification,
      attemptEmailAddressVerification: mockAttemptEmailAddressVerification,
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

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all input fields", () => {
    render(<SignUpForm />);
    expect(screen.getByPlaceholderText("John Doe")).toBeDefined();
    expect(screen.getByPlaceholderText("name@example.com")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter your password")).toBeDefined();
    expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
  });

  it("renders the submit button with 'Create Account' text", () => {
    render(<SignUpForm />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeDefined();
  });

  it("renders the heading", () => {
    render(<SignUpForm />);
    expect(screen.getByText("Create your account")).toBeDefined();
  });

  it("renders the Log In tab as a link to /login", () => {
    render(<SignUpForm />);
    const loginLink = screen.getByText("Log In");
    expect(loginLink.closest("a")).toBeDefined();
    expect(loginLink.closest("a")?.getAttribute("href")).toBe("/login");
  });

  it("toggles password visibility independently for each field", async () => {
    render(<SignUpForm />);
    const passwordField = screen.getByPlaceholderText("Enter your password");
    const confirmField = screen.getByPlaceholderText("••••••••");

    expect(passwordField.getAttribute("type")).toBe("password");
    expect(confirmField.getAttribute("type")).toBe("password");

    const toggleButtons = screen.getAllByRole("button", { name: /show password|hide password/i });
    expect(toggleButtons.length).toBe(2);

    await userEvent.click(toggleButtons[0]);
    expect(passwordField.getAttribute("type")).toBe("text");
    expect(confirmField.getAttribute("type")).toBe("password");

    await userEvent.click(toggleButtons[1]);
    expect(confirmField.getAttribute("type")).toBe("text");
  });

  it("submits sign-up and transitions to verification step", async () => {
    mockSignUpCreate.mockResolvedValueOnce({});
    mockPrepareEmailAddressVerification.mockResolvedValueOnce({});

    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan Dela Cruz");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "juan@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "SecurePass1!");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "SecurePass1!");

    const submitBtn = screen.getByRole("button", { name: /create account/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        firstName: "Juan",
        lastName: "Dela Cruz",
        emailAddress: "juan@example.com",
        password: "SecurePass1!",
      });
      expect(mockPrepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: "email_code",
      });
      expect(screen.getByText("Verify your email")).toBeDefined();
    });
  });

  it("shows error when passwords do not match", async () => {
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "juan@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "Secure@123");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Different@123");

    const submitBtn = screen.getByRole("button", { name: /create account/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeDefined();
    });

    expect(mockSignUpCreate).not.toHaveBeenCalled();
  });

  it("renders active Google and Apple SSO buttons", () => {
    render(<SignUpForm />);
    const googleBtn = screen.getByRole("button", { name: /google/i });
    const appleBtn = screen.getByRole("button", { name: /apple/i });
    expect(googleBtn).toBeDefined();
    expect(appleBtn).toBeDefined();
  });
});

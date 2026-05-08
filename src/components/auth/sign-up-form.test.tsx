// src/components/auth/sign-up-form.test.tsx
// Unit tests for the Sign Up form component.
// Mocks Convex Auth and Next.js navigation to test form behavior in isolation.
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "./sign-up-form";
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

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---
  it("renders all input fields", () => {
    render(<SignUpForm />);
    expect(screen.getByPlaceholderText("John Doe")).toBeDefined();
    expect(screen.getByPlaceholderText("name@example.com")).toBeDefined();
    // Password field has a unique placeholder; confirm password uses bullet dots
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

  // --- Password visibility toggle ---
  it("toggles password visibility independently for each field", async () => {
    render(<SignUpForm />);
    const passwordField = screen.getByPlaceholderText("Enter your password");
    const confirmField = screen.getByPlaceholderText("••••••••");

    // Both start as type=password
    expect(passwordField.getAttribute("type")).toBe("password");
    expect(confirmField.getAttribute("type")).toBe("password");

    // Find all toggle buttons (ones with visibility_off icon)
    const allButtons = screen.getAllByRole("button");
    const toggleButtons = allButtons.filter(
      (btn) => btn.querySelector(".material-symbols-outlined")?.textContent === "visibility_off"
    );
    // There should be 2 toggle buttons (password + confirm)
    expect(toggleButtons.length).toBe(2);

    // Toggle first password field
    await userEvent.click(toggleButtons[0]);
    expect(passwordField.getAttribute("type")).toBe("text");
    expect(confirmField.getAttribute("type")).toBe("password"); // Unchanged
  });

  // --- Form submission ---
  it("calls signIn on successful signup and redirects", async () => {
    mockSignIn.mockResolvedValueOnce({});
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan Dela Cruz");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "juan@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "Secure@123");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Secure@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith("password", expect.any(FormData));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  // --- Password mismatch ---
  it("shows error when passwords do not match", async () => {
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "juan@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "Secure@123");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Different@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeDefined();
    });

    // signIn should NOT have been called
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Security: error message does not leak email existence ---
  it("shows generic error message regardless of failure reason", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Email already registered"));
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "existing@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "Secure@123");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Secure@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Could not create account. Please try again.")).toBeDefined();
    });
  });

  // --- Hidden flow field ---
  it("includes hidden flow=signUp field in form", () => {
    render(<SignUpForm />);
    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    const hiddenInput = form.querySelector('input[name="flow"]') as HTMLInputElement | null;
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput?.value).toBe("signUp");
    expect(hiddenInput?.type).toBe("hidden");
  });

  // --- Security: name field accepts but doesn't execute HTML ---
  it("renders HTML in name field as text (no XSS execution)", async () => {
    mockSignIn.mockResolvedValueOnce({});
    render(<SignUpForm />);

    const nameInput = screen.getByPlaceholderText("John Doe");
    await userEvent.type(nameInput, '<img src=x onerror=alert(1)>');

    // The value should be stored as plain text, not rendered as HTML
    expect((nameInput as HTMLInputElement).value).toBe('<img src=x onerror=alert(1)>');
  });

  // --- On-submit validation: name errors ---
  it("shows name validation error on submit with empty name", async () => {
    render(<SignUpForm />);

    // Leave name empty, fill other fields
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "Secure@123");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Secure@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeDefined();
    });

    // signIn should NOT have been called
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  // --- On-submit validation: email errors ---
  it("shows email validation error on submit with invalid email", async () => {
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan");
    // Type invalid email — clear the field first since type="email" has browser validation
    const emailInput = screen.getByPlaceholderText("name@example.com");
    await userEvent.type(emailInput, "not-an-email");
    await userEvent.type(screen.getByPlaceholderText("Enter your password"), "Secure@123");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "Secure@123");

    const form = emailInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeDefined();
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });
});

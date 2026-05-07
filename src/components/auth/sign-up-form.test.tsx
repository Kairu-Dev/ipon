// src/components/auth/sign-up-form.test.tsx
// Unit tests for the Sign Up form component.
// Mocks Convex Auth and Next.js navigation to test form behavior in isolation.
import { render, screen, fireEvent } from "@testing-library/react";
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
    // Two password fields (password + confirm)
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs.length).toBe(2);
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
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    const passwordField = passwordInputs[0];
    const confirmField = passwordInputs[1];

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
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(passwordInputs[0], "Secure@123");
    await userEvent.type(passwordInputs[1], "Secure@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith("password", expect.any(FormData));

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  // --- Password mismatch ---
  it("shows error when passwords do not match", async () => {
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "juan@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(passwordInputs[0], "Secure@123");
    await userEvent.type(passwordInputs[1], "Different@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeDefined();
    });

    // signIn should NOT have been called
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  // --- Server error ---
  it("shows server error message on signup failure", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Email already registered"));
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "existing@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(passwordInputs[0], "Secure@123");
    await userEvent.type(passwordInputs[1], "Secure@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeDefined();
    });
  });

  it("shows generic fallback for non-Error exceptions", async () => {
    mockSignIn.mockRejectedValueOnce("string error");
    render(<SignUpForm />);

    await userEvent.type(screen.getByPlaceholderText("John Doe"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("name@example.com"), "test@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(passwordInputs[0], "Secure@123");
    await userEvent.type(passwordInputs[1], "Secure@123");

    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    fireEvent.submit(form);

    await vi.waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeDefined();
    });
  });

  // --- Hidden flow field ---
  it("includes hidden flow=signUp field in form", () => {
    render(<SignUpForm />);
    const form = screen.getByPlaceholderText("name@example.com").closest("form")!;
    const hiddenInput = form.querySelector('input[name="flow"]') as HTMLInputElement;
    expect(hiddenInput).toBeDefined();
    expect(hiddenInput.value).toBe("signUp");
    expect(hiddenInput.type).toBe("hidden");
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
});

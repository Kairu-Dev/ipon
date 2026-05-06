import { render, screen } from "@testing-library/react";
import { LoginForm } from "./login-form";
import { describe, it, expect, vi } from "vitest";

// Mock next/navigation hooks used by LoginForm
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next/link since LoginForm uses <Link> for Sign Up tab
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("LoginForm", () => {
  it("renders email and password inputs", () => {
    render(<LoginForm />);
    // Email input has placeholder="name@example.com"
    expect(screen.getByPlaceholderText("name@example.com")).toBeDefined();
    // Password input has placeholder="••••••••"
    expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
  });

  it("renders the submit button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  });

  it("renders the heading", () => {
    render(<LoginForm />);
    expect(screen.getByText("Welcome back")).toBeDefined();
  });
});

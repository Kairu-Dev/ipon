import { render, screen } from "@testing-library/react";
import { SignUpForm } from "./sign-up-form";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("SignUpForm", () => {
  it("renders all input fields", () => {
    render(<SignUpForm />);
    // Full Name: placeholder="John Doe"
    expect(screen.getByPlaceholderText("John Doe")).toBeDefined();
    // Email: placeholder="name@example.com"
    expect(screen.getByPlaceholderText("name@example.com")).toBeDefined();
    // Password fields (2 with same placeholder)
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs.length).toBe(2);
  });

  it("renders the submit button", () => {
    render(<SignUpForm />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeDefined();
  });

  it("renders the heading", () => {
    render(<SignUpForm />);
    expect(screen.getByText("Create your account")).toBeDefined();
  });
});

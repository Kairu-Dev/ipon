import { render, screen } from "@testing-library/react";
import { LoginForm } from "./login-form";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("LoginForm", () => {
  it("renders login inputs", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeDefined();
  });
});


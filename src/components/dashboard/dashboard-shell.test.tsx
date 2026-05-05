import { render, screen } from "@testing-library/react";
import { DashboardShell } from "./dashboard-shell";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("DashboardShell", () => {
  it("renders children inside shell", () => {
    // For this test, assume isLoggedIn is true (we might need to mock store if it's strictly needed, but let's try without first or mock if it fails)
    render(<DashboardShell>Test Content</DashboardShell>);
  });
});

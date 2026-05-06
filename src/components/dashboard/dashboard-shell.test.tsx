import { render, screen } from "@testing-library/react";
import { DashboardShell } from "./dashboard-shell";
import { describe, it, expect, vi } from "vitest";
import { useUIStore } from "@/store/ui-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/dashboard",
}));

// Mock next/link since DashboardShell uses <Link> for nav items
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("DashboardShell", () => {
  it("renders nothing when not logged in", () => {
    useUIStore.setState({ isLoggedIn: false });
    const { container } = render(<DashboardShell>Secret Content</DashboardShell>);
    expect(container.innerHTML).toBe("");
  });

  it("renders children when logged in", () => {
    useUIStore.setState({ isLoggedIn: true });
    render(<DashboardShell>Dashboard Content</DashboardShell>);
    expect(screen.getByText("Dashboard Content")).toBeDefined();
  });
});

// src/components/dashboard/dashboard-shell.test.tsx
// Unit tests for the DashboardShell component.
// Mocks Convex Auth hooks and Next.js navigation.
import { render, screen } from "@testing-library/react";
import { DashboardShell } from "./dashboard-shell";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock useConvexAuth to control isAuthenticated and isLoading
const mockUseConvexAuth = vi.fn();
vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
}));

// Mock useAuthActions (signOut)
const mockSignOut = vi.fn();
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signOut: mockSignOut }),
}));

// Mock Next.js navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
  }),
  usePathname: () => "/dashboard",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

describe("DashboardShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton when auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    render(<DashboardShell>Secret Content</DashboardShell>);
    // Skeleton should be visible, children should not
    expect(screen.getByText("Loading your dashboard…")).toBeDefined();
    expect(screen.queryByText("Secret Content")).toBeNull();
  });

  it("renders children when authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(<DashboardShell>Dashboard Content</DashboardShell>);
    expect(screen.getByText("Dashboard Content")).toBeDefined();
  });

  it("renders nothing and triggers redirect when not authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    const { container } = render(<DashboardShell>Secret Content</DashboardShell>);
    // Should render nothing (redirect via useEffect)
    expect(container.innerHTML).toBe("");
    expect(screen.queryByText("Secret Content")).toBeNull();
  });

  it("renders logout button when authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(<DashboardShell>Content</DashboardShell>);
    expect(screen.getByText("Logout")).toBeDefined();
  });

  it("renders navigation links when authenticated", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    render(<DashboardShell>Content</DashboardShell>);
    // Verify nav links exist (desktop sidebar)
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Transactions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Budget").length).toBeGreaterThan(0);
  });
});

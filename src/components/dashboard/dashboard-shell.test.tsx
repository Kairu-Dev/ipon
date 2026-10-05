// src/components/dashboard/dashboard-shell.test.tsx
// Unit tests for the DashboardShell component.
// Mocks Clerk and Convex Auth hooks and Next.js navigation.
import { render, screen } from "@testing-library/react";
import { DashboardShell } from "./dashboard-shell";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock useConvexAuth to control isAuthenticated and isLoading
const mockUseConvexAuth = vi.fn();
vi.mock("convex/react", () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useAction: vi.fn(),
}));

// Mock useEnsureUser
const mockUseEnsureUser = vi.fn(() => ({ isReady: true, isLoading: false }));
vi.mock("@/hooks/use-ensure-user", () => ({
  useEnsureUser: () => mockUseEnsureUser(),
}));

// Mock useClerk (signOut) and useAuth
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn(() => ({ isLoaded: true, isSignedIn: true }));
vi.mock("@clerk/nextjs", () => ({
  useClerk: () => ({ signOut: mockSignOut }),
  useAuth: () => mockUseAuth(),
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
    mockUseEnsureUser.mockReturnValue({ isReady: true, isLoading: false });
  });

  it("shows loading skeleton when auth is loading", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    render(<DashboardShell>Secret Content</DashboardShell>);
    // Skeleton should be visible, children should not
    expect(screen.getByText("Loading your dashboard…")).toBeDefined();
    expect(screen.queryByText("Secret Content")).toBeNull();
  });

  it("shows loading skeleton when authenticated but ensureUser is not ready", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseEnsureUser.mockReturnValue({ isReady: false, isLoading: true });
    render(<DashboardShell>Secret Content</DashboardShell>);
    expect(screen.getByText("Loading your dashboard…")).toBeDefined();
    expect(screen.queryByText("Secret Content")).toBeNull();
  });

  it("renders children when authenticated and ready", () => {
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockUseEnsureUser.mockReturnValue({ isReady: true, isLoading: false });
    render(<DashboardShell>Dashboard Content</DashboardShell>);
    expect(screen.getByText("Dashboard Content")).toBeDefined();
  });

  it("triggers redirect and keeps styled container when not authenticated", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });
    mockUseConvexAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    render(<DashboardShell>Secret Content</DashboardShell>);
    expect(screen.queryByText("Secret Content")).toBeNull();
    // Should trigger redirect to login
    expect(mockReplace).toHaveBeenCalledWith("/login");
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

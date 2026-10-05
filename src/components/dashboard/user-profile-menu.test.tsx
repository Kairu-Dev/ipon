import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserProfileMenu } from "@/components/dashboard/user-profile-menu";

const mockSignOut = vi.fn();
const mockUser = {
  fullName: "Kyle Soliman",
  primaryEmailAddress: { emailAddress: "kyle@example.com" },
  imageUrl: "https://example.com/avatar.jpg",
};

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: mockUser, isLoaded: true }),
  useClerk: () => ({ signOut: mockSignOut }),
}));

describe("UserProfileMenu", () => {
  it("renders user avatar and initials", () => {
    render(<UserProfileMenu />);
    const avatar = screen.getByRole("button", { name: /user profile menu/i });
    expect(avatar).toBeDefined();
  });

  it("opens dropdown menu on click with user details and links", () => {
    render(<UserProfileMenu />);
    const avatar = screen.getByRole("button", { name: /user profile menu/i });
    fireEvent.click(avatar);

    expect(screen.getByText("Kyle Soliman")).toBeDefined();
    expect(screen.getByText("kyle@example.com")).toBeDefined();
    expect(screen.getByRole("link", { name: /account settings/i })).toBeDefined();

    const logoutBtn = screen.getByRole("button", { name: /log out/i });
    fireEvent.click(logoutBtn);
    expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: "/login" });
  });
});

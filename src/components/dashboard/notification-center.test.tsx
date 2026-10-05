import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationCenter } from "./notification-center";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => [
    { _id: "b1", category: "Dining", monthlyLimit: 5000 },
    { _id: "g1", name: "Emergency Fund", targetAmount: 10000, savedAmount: 8500 },
  ]),
}));

describe("NotificationCenter", () => {
  it("renders notification bell button", () => {
    render(<NotificationCenter />);
    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    expect(bellBtn).toBeDefined();
  });

  it("opens notification popover when clicked", () => {
    render(<NotificationCenter />);
    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(screen.getByText("Notifications")).toBeDefined();
    expect(screen.getByText(/Emergency Fund is 85% reached/i)).toBeDefined();
  });
});

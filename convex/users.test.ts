/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { updatePreferences } from "./users";

describe("convex/users updatePreferences", () => {
  it("throws ConvexError when unauthenticated", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(null),
      },
      db: {
        query: vi.fn(),
      },
    };

    // @ts-expect-error handler property test
    const handler = updatePreferences._handler || updatePreferences;
    await expect(
      handler(ctx as any, {
        currency: "USD",
        defaultPaymentMethod: "Cash",
        paydayCycle: "Monthly",
        aiSuggestions: false,
      })
    ).rejects.toThrow();
  });

  it("updates user record with new preferences", async () => {
    const mockUser = {
      _id: "users_123",
      clerkId: "clerk_abc",
      name: "Kyle",
      email: "kyle@example.com",
    };

    const patchMock = vi.fn().mockResolvedValue(undefined);

    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "clerk_abc" }),
      },
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnValue({
            unique: vi.fn().mockResolvedValue(mockUser),
          }),
        }),
        patch: patchMock,
      },
    };

    // @ts-expect-error handler property test
    const handler = updatePreferences._handler || updatePreferences;
    const result = await handler(ctx as any, {
      currency: "USD",
      defaultPaymentMethod: "Maya",
      paydayCycle: "Monthly",
      aiSuggestions: false,
    });

    expect(result).toBe("users_123");
    expect(patchMock).toHaveBeenCalledWith("users_123", {
      currency: "USD",
      defaultPaymentMethod: "Maya",
      paydayCycle: "Monthly",
      aiSuggestions: false,
    });
  });
});

import { describe, it, expect, vi } from "vitest";
import { getCurrentUserId, requireUserId, getUserIdFromAction } from "./auth";
import { ConvexError } from "convex/values";

describe("convex/lib/auth helper", () => {
  it("getCurrentUserId returns null when unauthenticated", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(null),
      },
      db: {
        query: vi.fn(),
      },
    };

    const userId = await getCurrentUserId(ctx as any);
    expect(userId).toBeNull();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("getCurrentUserId returns users row id for a known clerkId", async () => {
    const mockUser = { _id: "users_123", clerkId: "user_clerk_abc" };
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_clerk_abc" }),
      },
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnValue({
            unique: vi.fn().mockResolvedValue(mockUser),
          }),
        }),
      },
    };

    const userId = await getCurrentUserId(ctx as any);
    expect(userId).toBe("users_123");
  });

  it("getCurrentUserId returns null when identity exists but no users row yet", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_clerk_new" }),
      },
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnValue({
            unique: vi.fn().mockResolvedValue(null),
          }),
        }),
      },
    };

    const userId = await getCurrentUserId(ctx as any);
    expect(userId).toBeNull();
  });

  it("requireUserId throws ConvexError when unauthenticated", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(null),
      },
      db: {
        query: vi.fn(),
      },
    };

    await expect(requireUserId(ctx as any)).rejects.toThrow(ConvexError);
  });

  it("requireUserId returns userId when authenticated", async () => {
    const mockUser = { _id: "users_456", clerkId: "user_clerk_xyz" };
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_clerk_xyz" }),
      },
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnValue({
            unique: vi.fn().mockResolvedValue(mockUser),
          }),
        }),
      },
    };

    const userId = await requireUserId(ctx as any);
    expect(userId).toBe("users_456");
  });

  it("getUserIdFromAction returns null when unauthenticated and does not call runQuery", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(null),
      },
      runQuery: vi.fn(),
    };

    const userId = await getUserIdFromAction(ctx as any);
    expect(userId).toBeNull();
    expect(ctx.runQuery).not.toHaveBeenCalled();
  });

  it("getUserIdFromAction queries internal users helper when authenticated", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_clerk_789" }),
      },
      runQuery: vi.fn().mockResolvedValue("users_789"),
    };

    const userId = await getUserIdFromAction(ctx as any);
    expect(userId).toBe("users_789");
    expect(ctx.runQuery).toHaveBeenCalled();
  });
});

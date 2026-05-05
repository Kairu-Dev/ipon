import { useUIStore } from "./ui-store";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("UI Store", () => {
  it("should toggle login state", () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.isLoggedIn).toBe(false);
    act(() => { result.current.setLoggedIn(true); });
    expect(result.current.isLoggedIn).toBe(true);
  });
});

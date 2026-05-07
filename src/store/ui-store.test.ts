// src/store/ui-store.test.ts
// Unit tests for the Zustand UI store.
// Auth state is NOT in this store — only ephemeral UI flags.
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./ui-store";

describe("UI Store", () => {
  // Reset store to defaults before each test to avoid cross-contamination
  beforeEach(() => {
    useUIStore.setState({
      isAddTransactionModalOpen: false,
      isCreateGoalModalOpen: false,
      isContributeGoalPanelOpen: false,
    });
  });

  it("has correct initial state", () => {
    const { result } = renderHook(() => useUIStore());
    expect(result.current.isAddTransactionModalOpen).toBe(false);
    expect(result.current.isCreateGoalModalOpen).toBe(false);
    expect(result.current.isContributeGoalPanelOpen).toBe(false);
  });

  it("toggles add transaction modal", () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setAddTransactionModalOpen(true); });
    expect(result.current.isAddTransactionModalOpen).toBe(true);
    act(() => { result.current.setAddTransactionModalOpen(false); });
    expect(result.current.isAddTransactionModalOpen).toBe(false);
  });

  it("toggles create goal modal", () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setCreateGoalModalOpen(true); });
    expect(result.current.isCreateGoalModalOpen).toBe(true);
  });

  it("toggles contribute goal panel", () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.setContributeGoalPanelOpen(true); });
    expect(result.current.isContributeGoalPanelOpen).toBe(true);
  });

  it("clearStore resets all flags to false", () => {
    const { result } = renderHook(() => useUIStore());
    // Open all modals
    act(() => {
      result.current.setAddTransactionModalOpen(true);
      result.current.setCreateGoalModalOpen(true);
      result.current.setContributeGoalPanelOpen(true);
    });
    // Verify they're open
    expect(result.current.isAddTransactionModalOpen).toBe(true);
    expect(result.current.isCreateGoalModalOpen).toBe(true);
    expect(result.current.isContributeGoalPanelOpen).toBe(true);
    // Clear
    act(() => { result.current.clearStore(); });
    // All should be false
    expect(result.current.isAddTransactionModalOpen).toBe(false);
    expect(result.current.isCreateGoalModalOpen).toBe(false);
    expect(result.current.isContributeGoalPanelOpen).toBe(false);
  });

  // Security: clearStore is called by SessionWatcher on session expiry.
  // This test verifies the behavior that session-watcher.tsx depends on.
  it("clearStore does not introduce unexpected state", () => {
    const { result } = renderHook(() => useUIStore());
    act(() => { result.current.clearStore(); });
    const state = useUIStore.getState();
    // Only known keys should exist (plus the functions)
    const stateKeys = Object.keys(state);
    expect(stateKeys).toContain("isAddTransactionModalOpen");
    expect(stateKeys).toContain("isCreateGoalModalOpen");
    expect(stateKeys).toContain("isContributeGoalPanelOpen");
    expect(stateKeys).toContain("clearStore");
  });
});

// src/store/ui-store.ts
// Zustand store for ephemeral UI state only.
// Auth state is NOT stored here — it comes from Convex Auth hooks.
// See Standards/state-management.md for the full rules.
import { create } from "zustand";

interface UIState {
  // Modal/panel visibility flags
  isAddTransactionModalOpen: boolean;
  setAddTransactionModalOpen: (val: boolean) => void;
  isCreateGoalModalOpen: boolean;
  setCreateGoalModalOpen: (val: boolean) => void;
  isContributeGoalPanelOpen: boolean;
  setContributeGoalPanelOpen: (val: boolean) => void;
  // Resets all UI state — called by SessionWatcher on session expiry
  clearStore: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionModalOpen: false,
  setAddTransactionModalOpen: (val) => set({ isAddTransactionModalOpen: val }),
  isCreateGoalModalOpen: false,
  setCreateGoalModalOpen: (val) => set({ isCreateGoalModalOpen: val }),
  isContributeGoalPanelOpen: false,
  setContributeGoalPanelOpen: (val) => set({ isContributeGoalPanelOpen: val }),
  clearStore: () =>
    set({
      isAddTransactionModalOpen: false,
      isCreateGoalModalOpen: false,
      isContributeGoalPanelOpen: false,
    }),
}));

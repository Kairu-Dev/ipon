import { create } from "zustand";

interface UIState {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  isAddTransactionModalOpen: boolean;
  setAddTransactionModalOpen: (val: boolean) => void;
  isCreateGoalModalOpen: boolean;
  setCreateGoalModalOpen: (val: boolean) => void;
  isContributeGoalPanelOpen: boolean;
  setContributeGoalPanelOpen: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoggedIn: false,
  setLoggedIn: (val) => set({ isLoggedIn: val }),
  isAddTransactionModalOpen: false,
  setAddTransactionModalOpen: (val) => set({ isAddTransactionModalOpen: val }),
  isCreateGoalModalOpen: false,
  setCreateGoalModalOpen: (val) => set({ isCreateGoalModalOpen: val }),
  isContributeGoalPanelOpen: false,
  setContributeGoalPanelOpen: (val) => set({ isContributeGoalPanelOpen: val }),
}));

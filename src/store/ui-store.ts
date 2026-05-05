import { create } from "zustand";

interface UIState {
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoggedIn: false,
  setLoggedIn: (val) => set({ isLoggedIn: val }),
}));

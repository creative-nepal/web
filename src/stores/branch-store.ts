import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BranchState {
  currentBranchId: string | null;
  setCurrentBranchId: (branchId: string | null) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      currentBranchId: null,
      setCurrentBranchId: (branchId) => set({ currentBranchId: branchId }),
    }),
    { name: "creative-nepal-branch" },
  ),
);

export function getCurrentBranchId(): string | null {
  return useBranchStore.getState().currentBranchId;
}

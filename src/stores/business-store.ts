import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SESSION_STORAGE_KEY } from "@/features/business/constants";

interface BusinessState {
  currentBusinessId: string | null;
  setCurrentBusinessId: (businessId: string | null) => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      currentBusinessId: null,
      setCurrentBusinessId: (businessId) =>
        set({ currentBusinessId: businessId }),
    }),
    { name: SESSION_STORAGE_KEY },
  ),
);

export function getCurrentBusinessId(): string | null {
  return useBusinessStore.getState().currentBusinessId;
}

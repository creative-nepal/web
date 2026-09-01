import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FALLBACK_LANGUAGE,
  LANGUAGE_COOKIE,
  LANGUAGE_STORAGE_KEY,
} from "@/features/i18n/constants";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function syncLanguageCookie(language: string) {
  if (typeof document === "undefined") {
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is still missing in Safari and Firefox
  document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(language)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

interface LanguageState {
  language: string;
  setLanguage: (language: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: FALLBACK_LANGUAGE,
      setLanguage: (language) => {
        syncLanguageCookie(language);
        set({ language });
      },
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        syncLanguageCookie(state?.language ?? FALLBACK_LANGUAGE);
      },
    },
  ),
);

export function getCurrentLanguage(): string {
  return useLanguageStore.getState().language;
}

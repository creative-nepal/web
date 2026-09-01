"use client";

import { useQuery } from "@tanstack/react-query";
import type * as React from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { useLanguageStore } from "@/stores/language-store";
import { catalogueQueryOptions, languagesQueryOptions } from "./queries";
import { createTranslate } from "./translate";
import type {
  Catalogue,
  CatalogueNode,
  LanguageOption,
  Translate,
} from "./types";

interface I18nContextValue {
  language: string;
  setLanguage: (language: string) => void;
  languages: LanguageOption[];
  isLoading: boolean;
  t: Translate;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  initialCatalogue?: Catalogue;
  initialLocale?: string;
}

export function I18nProvider({
  children,
  initialCatalogue,
  initialLocale,
}: I18nProviderProps) {
  const storedLanguage = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [hydrated, setHydrated] = useState(false);
  const language = hydrated
    ? storedLanguage
    : (initialLocale ?? storedLanguage);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const { data: languages } = useQuery(languagesQueryOptions());
  const { data: catalogue, isLoading } = useQuery(
    catalogueQueryOptions(
      language,
      initialCatalogue?.lang === language ? initialCatalogue : undefined,
    ),
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const flat: Record<string, CatalogueNode> = {
      common: catalogue?.common ?? {},
      errors: catalogue?.errors ?? {},
      ui: catalogue?.ui ?? {},
    };

    return {
      language,
      setLanguage,
      languages: languages ?? [],
      isLoading,
      t: createTranslate(flat),
    };
  }, [catalogue, language, languages, isLoading, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

import { cookies } from "next/headers";
import {
  FALLBACK_LANGUAGE,
  LANGUAGE_COOKIE,
  SUPPORTED_LANGUAGES,
} from "./constants";
import { createTranslate } from "./translate";
import type { Catalogue, SupportedLanguage, Translate } from "./types";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3333";

const CATALOGUE_REVALIDATE_SECONDS = 3600;

function isSupported(value: string | undefined): value is SupportedLanguage {
  return (
    value !== undefined &&
    (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
  );
}

export async function resolveLocale(): Promise<SupportedLanguage> {
  const store = await cookies();
  const value = store.get(LANGUAGE_COOKIE)?.value;

  return isSupported(value) ? value : FALLBACK_LANGUAGE;
}

async function fetchCatalogue(
  locale: SupportedLanguage,
): Promise<Catalogue | null> {
  try {
    const response = await fetch(`${API_URL}/api/v1/i18n/${locale}`, {
      next: { revalidate: CATALOGUE_REVALIDATE_SECONDS, tags: ["i18n"] },
    });

    return response.ok ? ((await response.json()) as Catalogue) : null;
  } catch {
    return null;
  }
}

export async function getTranslations(): Promise<{
  locale: SupportedLanguage;
  catalogue: Catalogue | undefined;
  t: Translate;
}> {
  const locale = await resolveLocale();
  const catalogue = await fetchCatalogue(locale);

  return {
    locale,
    catalogue: catalogue ?? undefined,
    t: createTranslate({
      common: catalogue?.common ?? {},
      errors: catalogue?.errors ?? {},
      ui: catalogue?.ui ?? {},
    }),
  };
}

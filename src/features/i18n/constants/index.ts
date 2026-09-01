export const LANGUAGE_STORAGE_KEY = "creative-nepal-language";
export const LANGUAGE_COOKIE = "creative-nepal-language";
export const LANGUAGE_HEADER = "x-language";
export const SUPPORTED_LANGUAGES = ["en", "ne"] as const;
export const FALLBACK_LANGUAGE = "en";

export const LANGUAGE_QUERY_KEYS = {
  all: ["i18n"] as const,
  languages: () => [...LANGUAGE_QUERY_KEYS.all, "languages"] as const,
  catalogue: (lang: string) =>
    [...LANGUAGE_QUERY_KEYS.all, "catalogue", lang] as const,
};

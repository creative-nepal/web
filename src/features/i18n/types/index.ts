import type { SUPPORTED_LANGUAGES } from "../constants";

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageOption {
  code: string;
  label: string;
}

export type CatalogueNode = string | { [key: string]: CatalogueNode };

export interface Catalogue {
  lang: string;
  common: Record<string, CatalogueNode>;
  errors: Record<string, CatalogueNode>;
  ui: Record<string, CatalogueNode>;
}

export type TranslateVars = Record<string, string | number>;

export type Translate = (key: string, vars?: TranslateVars) => string;

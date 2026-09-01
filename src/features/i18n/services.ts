import { api } from "@/lib/api";
import type { Catalogue, LanguageOption } from "./types";

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const { data } = await api.get<LanguageOption[]>("/api/v1/i18n/languages");
  return data;
}

export async function fetchCatalogue(lang: string): Promise<Catalogue> {
  const { data } = await api.get<Catalogue>(`/api/v1/i18n/${lang}`);
  return data;
}

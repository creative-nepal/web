import { queryOptions } from "@tanstack/react-query";
import { LANGUAGE_QUERY_KEYS } from "./constants";
import { fetchCatalogue, fetchLanguages } from "./services";
import type { Catalogue } from "./types";

export function languagesQueryOptions() {
  return queryOptions({
    queryKey: LANGUAGE_QUERY_KEYS.languages(),
    queryFn: fetchLanguages,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function catalogueQueryOptions(lang: string, initialData?: Catalogue) {
  return queryOptions({
    queryKey: LANGUAGE_QUERY_KEYS.catalogue(lang),
    queryFn: () => fetchCatalogue(lang),
    staleTime: Number.POSITIVE_INFINITY,
    initialData,
  });
}

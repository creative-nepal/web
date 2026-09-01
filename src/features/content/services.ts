import { resolveLocale } from "@/features/i18n/server";
import type {
  ContentLocale,
  ContentNavigation,
  ContentPage,
  PublishedPageRef,
} from "./types";

export { resolveLocale };

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3333";

const REVALIDATE_SECONDS = 300;
export const CONTENT_CACHE_TAG = "content";

interface ContentFetchOptions {
  preview?: boolean;
  allowNotFound?: boolean;
}

async function contentFetch<T>(
  path: string,
  { preview = false, allowNotFound = false }: ContentFetchOptions = {},
): Promise<T | null> {
  const previewSecret = process.env.CONTENT_PREVIEW_SECRET;

  const response = await fetch(`${API_URL}/api/v1/content${path}`, {
    headers:
      preview && previewSecret ? { "x-preview-secret": previewSecret } : {},
    ...(preview
      ? { cache: "no-store" as const }
      : {
          next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] },
        }),
  });

  if (response.status === 404 && allowNotFound) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Content request failed: ${response.status} ${response.statusText} (${path})`,
    );
  }

  return (await response.json()) as T;
}

export async function fetchContentPage(
  slug: string,
  locale: ContentLocale,
  preview = false,
): Promise<ContentPage | null> {
  return contentFetch<ContentPage>(
    `/pages/${encodeURIComponent(slug)}?locale=${locale}`,
    { preview, allowNotFound: true },
  );
}

export async function fetchNavigation(
  locale: ContentLocale,
): Promise<ContentNavigation> {
  const navigation = await contentFetch<ContentNavigation>(
    `/navigation?locale=${locale}`,
    { allowNotFound: true },
  );

  return (
    navigation ?? {
      locale,
      header: [],
      footer: [],
      tagline: null,
      copyright: null,
    }
  );
}

export async function fetchPublishedPages(): Promise<PublishedPageRef[]> {
  return (await contentFetch<PublishedPageRef[]>("/pages")) ?? [];
}

import type { MetadataRoute } from "next";
import { fetchPublishedPages } from "@/features/content/services";
import { HOME_SLUG } from "@/features/content/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const pages = await fetchPublishedPages();

    return pages.map((page) => ({
      url: page.slug === HOME_SLUG ? SITE_URL : `${SITE_URL}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
    }));
  } catch {
    return [{ url: SITE_URL }];
  }
}

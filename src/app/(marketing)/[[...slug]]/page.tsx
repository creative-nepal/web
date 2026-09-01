import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/features/content/components/block-renderer";
import { PreviewBanner } from "@/features/content/components/preview-banner";
import { fetchContentPage, resolveLocale } from "@/features/content/services";
import { HOME_SLUG } from "@/features/content/types";
import { getTranslations } from "@/features/i18n/server";

function slugFromSegments(segments: string[] | undefined): string | null {
  if (!segments || segments.length === 0) {
    return HOME_SLUG;
  }

  return segments.length === 1 ? segments[0] : null;
}

async function loadPage(segments: string[] | undefined) {
  const slug = slugFromSegments(segments);

  if (!slug) {
    return null;
  }

  const [locale, { isEnabled: isPreview }] = await Promise.all([
    resolveLocale(),
    draftMode(),
  ]);

  const page = await fetchContentPage(slug, locale, isPreview);

  return page ? { page, isPreview } : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadPage(slug);

  if (!result) {
    const { t } = await getTranslations();

    return { title: t("ui.error.notFoundTitle") };
  }

  const { page } = result;
  const title = page.seo.title ?? page.title;
  const description = page.seo.description;

  return {
    title,
    description,
    robots: page.seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      images: page.seo.ogImageUrl ? [{ url: page.seo.ogImageUrl }] : undefined,
    },
  };
}

export default async function ContentPage({
  params,
}: PageProps<"/[[...slug]]">) {
  const { slug } = await params;
  const result = await loadPage(slug);

  if (!result) {
    notFound();
  }

  const { page, isPreview } = result;

  return (
    <>
      {isPreview && <PreviewBanner slug={page.slug} />}
      <BlockRenderer blocks={page.blocks} />
    </>
  );
}

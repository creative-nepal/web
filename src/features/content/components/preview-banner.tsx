import { getTranslations } from "@/features/i18n/server";
export async function PreviewBanner({ slug }: { slug: string }) {
  const { t } = await getTranslations();

  return (
    <div className="flex items-center justify-center gap-3 border-b bg-primary px-4 py-2 text-xs text-primary-foreground">
      <span>{t("ui.web.site.previewBanner")}</span>
      <a
        className="underline underline-offset-4"
        href={`/api/preview?disable=1&slug=${encodeURIComponent(slug)}`}
      >
        {t("ui.web.site.exitPreview")}
      </a>
    </div>
  );
}

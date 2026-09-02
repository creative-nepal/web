import Link from "next/link";
import { getTranslations } from "@/features/i18n/server";
import type { ContentNavigation } from "../types";

export async function SiteFooter({
  navigation,
}: {
  navigation: ContentNavigation;
}) {
  const { t } = await getTranslations();
  const year = new Date().getFullYear();
  const hasGroups = navigation.footer.length > 0;

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
        {hasGroups && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {navigation.footer.map((group) => (
              <div key={group.id} className="flex flex-col gap-2">
                <p className="font-heading text-xs font-medium">
                  {group.label}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {group.links.map((link) => (
                    <li key={link.id}>
                      {link.external ? (
                        <a
                          href={link.href}
                          className="text-xs text-muted-foreground hover:text-foreground"
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{navigation.tagline}</span>
          <span>
            © {year} {navigation.copyright ?? t("ui.brand.name")}
          </span>
        </div>
      </div>
    </footer>
  );
}

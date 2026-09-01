import type * as React from "react";
import { SiteHeader } from "@/features/auth/components/site-header";
import { fetchNavigation, resolveLocale } from "@/features/content/services";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await resolveLocale();
  const navigation = await fetchNavigation(locale);

  return (
    <>
      <SiteHeader links={navigation.header} />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}

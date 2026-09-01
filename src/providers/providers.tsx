"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type * as React from "react";
import { useState } from "react";
import { I18nProvider } from "@/features/i18n/i18n-provider";
import type { Catalogue } from "@/features/i18n/types";
import { createQueryClient } from "@/lib/api-client/query-client";

export function Providers({
  children,
  catalogue,
  locale,
}: {
  children: React.ReactNode;
  catalogue?: Catalogue;
  locale?: string;
}) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialCatalogue={catalogue} initialLocale={locale}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </I18nProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

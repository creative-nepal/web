"use client";

import { RiErrorWarningLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/composed/error-state";
import { Button } from "@/components/ui/button";
import { logRouteError } from "@/lib/log-error";
import type { RouteErrorProps } from "@/types/error";
import "./globals.css";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export default function GlobalError({ error, retry }: RouteErrorProps) {
  const { t } = useTranslation();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    logRouteError(error, "global");
  }, [error]);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = stored === "dark" || (stored !== "light" && prefersDark);

    setTheme(isDark ? "dark" : "light");
  }, []);

  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <body className="min-h-svh bg-background font-mono text-foreground antialiased">
        <main className="flex min-h-svh items-center justify-center p-6">
          <ErrorState
            code="500"
            icon={<RiErrorWarningLine />}
            title={t("ui.error.appCrashedWeb")}
            description={t("ui.error.appCrashedBody")}
            digest={error.digest}
            digestLabel={t("ui.error.reference")}
            action={
              <Button onClick={() => retry()}>{t("ui.action.reload")}</Button>
            }
          />
        </main>
      </body>
    </html>
  );
}

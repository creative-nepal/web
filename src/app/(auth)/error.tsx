"use client";

import { RiShieldKeyholeLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/composed/error-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { logRouteError } from "@/lib/log-error";
import type { RouteErrorProps } from "@/types/error";

export default function AuthError({ error, retry }: RouteErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    logRouteError(error, "auth");
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        icon={<RiShieldKeyholeLine />}
        title={t("ui.error.authUnavailableTitle")}
        description={t("ui.error.authUnavailableBody")}
        digest={error.digest}
        digestLabel={t("ui.error.reference")}
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => retry()}>{t("ui.action.tryAgain")}</Button>
            <Button variant="outline" render={<Link href="/login" />}>
              {t("ui.action.backToSignIn")}
            </Button>
          </div>
        }
      />
    </main>
  );
}

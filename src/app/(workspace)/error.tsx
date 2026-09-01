"use client";

import { RiErrorWarningLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect } from "react";
import { ErrorState } from "@/components/composed/error-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { logRouteError } from "@/lib/log-error";
import type { RouteErrorProps } from "@/types/error";

export default function WorkspaceError({ error, retry }: RouteErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    logRouteError(error, "workspace");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <ErrorState
        icon={<RiErrorWarningLine />}
        title={t("ui.error.screenFailedTitle")}
        description={t("ui.error.screenFailedBody")}
        digest={error.digest}
        digestLabel={t("ui.error.reference")}
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => retry()}>{t("ui.action.tryAgain")}</Button>
            <Button variant="outline" render={<Link href="/" />}>
              {t("ui.action.goHome")}
            </Button>
          </div>
        }
      />
    </div>
  );
}

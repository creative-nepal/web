"use client";

import { RiCompass3Line } from "@remixicon/react";
import Link from "next/link";
import { ErrorState } from "@/components/composed/error-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export default function WorkspaceNotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <ErrorState
        code="404"
        icon={<RiCompass3Line />}
        title={t("ui.error.workspaceNotFoundTitle")}
        description={t("ui.error.workspaceNotFoundBody")}
        action={
          <Button render={<Link href="/" />}>{t("ui.action.goHome")}</Button>
        }
      />
    </div>
  );
}

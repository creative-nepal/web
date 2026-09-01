import { RiCompass3Line } from "@remixicon/react";
import Link from "next/link";
import { ErrorState } from "@/components/composed/error-state";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/features/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslations();

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <ErrorState
        code="404"
        icon={<RiCompass3Line />}
        title={t("ui.error.notFoundTitle")}
        description={t("ui.error.notFoundBodyWeb")}
        action={
          <Button render={<Link href="/" />}>{t("ui.action.goHome")}</Button>
        }
      />
    </main>
  );
}

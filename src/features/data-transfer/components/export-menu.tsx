"use client";

import { RiDownload2Line } from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { downloadExport } from "../services";

export function ExportMenu({
  businessId,
  resource,
}: {
  businessId: string;
  resource: string;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const run = async (format: "csv" | "xlsx") => {
    setBusy(true);
    try {
      await downloadExport(businessId, resource, format);
    } catch (error) {
      toast.error(apiErrorMessage(error, t("ui.web.data.exportFailed")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" disabled={busy}>
            <RiDownload2Line />
            {busy ? t("ui.web.data.exporting") : t("ui.web.data.export")}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => run("xlsx")}>
          {t("ui.web.data.exportExcel")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("csv")}>
          {t("ui.web.data.exportCsv")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

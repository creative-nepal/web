"use client";

import { useState } from "react";
import { DateRangeFilter } from "@/components/date-range-filter";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { downloadPurchaseRegister, downloadTdsReturn } from "../services";

export function PurchaseReportsTab({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Kharid Khata is the purchase-side register IRD expects alongside the
        sales register. The TDS return lists what was withheld from suppliers
        and is owed to IRD.
      </p>

      <DateRangeFilter
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        actions={[
          {
            label: t("ui.web.purchasing.purchaseRegister"),
            onClick: () =>
              downloadPurchaseRegister(businessId, from, to, "xlsx"),
          },
          {
            label: t("ui.web.purchasing.tdsReturn"),
            onClick: () => downloadTdsReturn(businessId, from, to, "xlsx"),
          },
        ]}
      />
    </div>
  );
}

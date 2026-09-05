"use client";

import { useState } from "react";
import { PageHeader } from "@/components/composed/page-header";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { AgingReport } from "./aging-report";
import { LiveSalesView } from "./live-sales-view";
import { ProfitReport } from "./profit-report";
import { StockMovementReport } from "./stock-movement-report";

const TABS = [
  "live",
  "profit",
  "receivables",
  "payables",
  "stockMovement",
] as const;

type Tab = (typeof TABS)[number];

export function ReportsView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const [tab, setTab] = useState<Tab>("live");

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t(`ui.web.reports.tab.${tab}`)}
        description={t(`ui.web.reports.${tab}Description`)}
      />

      <div className="flex flex-wrap gap-1">
        {TABS.map((entry) => (
          <Button
            key={entry}
            size="sm"
            variant={tab === entry ? "default" : "outline"}
            onClick={() => setTab(entry)}
          >
            {t(`ui.web.reports.tab.${entry}`)}
          </Button>
        ))}
      </div>

      {tab === "live" && <LiveSalesView />}
      {tab === "profit" && <ProfitReport businessId={business.id} />}
      {tab === "receivables" && (
        <AgingReport businessId={business.id} kind="receivables" />
      )}
      {tab === "payables" && (
        <AgingReport businessId={business.id} kind="payables" />
      )}
      {tab === "stockMovement" && (
        <StockMovementReport businessId={business.id} />
      )}
    </div>
  );
}

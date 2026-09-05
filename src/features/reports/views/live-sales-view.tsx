"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import { formatBs } from "@/lib/formatters/nepali-date";
import { useLanguageStore } from "@/stores/language-store";
import { BreakdownCard } from "../components/breakdown-card";
import { HourlyBars } from "../components/hourly-bars";
import { StatCards } from "../components/stat-cards";
import { liveSalesQueryOptions } from "../queries";

function money(cents: number): string {
  return formatCurrency(cents / 100, "NPR");
}

function _hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function LiveSalesView() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);

  const business = useCurrentBusiness();
  const [businessDate, setBusinessDate] = useState("");

  const { data, isFetching, dataUpdatedAt } = useQuery(
    liveSalesQueryOptions(business?.id ?? "", businessDate),
  );

  if (!business) {
    return null;
  }

  const totals = data?.totals;
  const _peak = Math.max(1, ...(data?.byHour ?? []).map((row) => row.netCents));

  const cards = [
    { key: "net", value: money(totals?.netCents ?? 0) },
    { key: "invoices", value: String(totals?.invoices ?? 0) },
    { key: "averageTicket", value: money(totals?.averageTicketCents ?? 0) },
    { key: "openOrders", value: money(data?.open.valueCents ?? 0) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap items-baseline gap-2 text-muted-foreground text-xs">
          <span>
            {data
              ? formatBs(
                  new Date(`${data.businessDate}T00:00:00Z`),
                  language === "ne" ? "ne" : "en",
                )
              : ""}
          </span>
          <span>·</span>
          <span className="tabular-nums">{data?.businessDate}</span>
          <span>·</span>
          <span>{data?.timezone}</span>
          {dataUpdatedAt > 0 && (
            <>
              <span>·</span>
              <span>
                {t("ui.web.reports.updatedAt", {
                  time: new Date(dataUpdatedAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={businessDate}
            onChange={(event) => setBusinessDate(event.target.value)}
            className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          />
          {businessDate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBusinessDate("")}
            >
              {t("ui.web.reports.today")}
            </Button>
          ) : (
            <Badge variant={isFetching ? "default" : "outline"}>
              {t("ui.web.reports.live")}
            </Badge>
          )}
        </div>
      </div>

      <StatCards
        stats={cards.map((card) => ({
          key: card.key,
          label: t(`ui.web.reports.${card.key}`),
          value: card.value,
        }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <HourlyBars hours={data?.byHour ?? []} />

        <BreakdownCard
          title={t("ui.web.reports.byPaymentMethod")}
          labelHeader={t("ui.field.method")}
          countHeader={t("ui.web.reports.count")}
          amountHeader={t("ui.field.amount")}
          emptyLabel={t("ui.web.reports.noPayments")}
          rows={(data?.byPaymentMethod ?? []).map((row) => ({
            key: row.method,
            label: t(`common.paymentMethod.${row.method}`),
            count: row.payments,
            amountCents: row.amountCents,
          }))}
        />
      </div>

      <BreakdownCard
        title={t("ui.web.reports.topItems")}
        labelHeader={t("ui.field.name")}
        countHeader={t("ui.field.quantity")}
        amountHeader={t("ui.web.reports.revenue")}
        emptyLabel={t("ui.web.reports.noSales")}
        rows={(data?.topItems ?? []).map((row) => ({
          key: row.name,
          label: row.name,
          count: row.quantity,
          amountCents: row.revenueCents,
        }))}
      />

      <div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
        <span>
          {t("ui.web.reports.gross")}: {money(totals?.grossCents ?? 0)}
        </span>
        <span>
          {t("ui.web.reports.discount")}: {money(totals?.discountCents ?? 0)}
        </span>
        <span>
          {t("ui.web.reports.serviceCharge")}:{" "}
          {money(totals?.serviceChargeCents ?? 0)}
        </span>
        <span>
          {t("ui.web.reports.vat")}: {money(totals?.vatCents ?? 0)}
        </span>
        <span>
          {t("ui.web.reports.creditNotes")}:{" "}
          {money(totals?.creditNoteCents ?? 0)}
        </span>
      </div>
    </div>
  );
}

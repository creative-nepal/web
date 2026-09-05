"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import { formatBs } from "@/lib/formatters/nepali-date";
import { useLanguageStore } from "@/stores/language-store";
import { liveSalesQueryOptions } from "../queries";

function money(cents: number): string {
  return formatCurrency(cents / 100, "NPR");
}

function hourLabel(hour: number): string {
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
  const peak = Math.max(1, ...(data?.byHour ?? []).map((row) => row.netCents));

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardContent className="flex flex-col gap-1 py-1">
              <span className="text-muted-foreground text-xs">
                {t(`ui.web.reports.${card.key}`)}
              </span>
              <span className="font-semibold text-xl tabular-nums">
                {card.value}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 py-1">
            <span className="font-medium text-sm">
              {t("ui.web.reports.byHour")}
            </span>
            {(data?.byHour ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("ui.web.reports.noSales")}
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {(data?.byHour ?? []).map((row) => (
                  <div key={row.hour} className="flex items-center gap-2">
                    <span className="w-12 text-muted-foreground text-xs tabular-nums">
                      {hourLabel(row.hour)}
                    </span>
                    <div className="h-4 flex-1 rounded-sm bg-muted">
                      <div
                        className="h-4 rounded-sm bg-primary"
                        style={{
                          width: `${Math.round((row.netCents / peak) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-24 text-right text-xs tabular-nums">
                      {money(row.netCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 py-1">
            <span className="font-medium text-sm">
              {t("ui.web.reports.byPaymentMethod")}
            </span>
            {(data?.byPaymentMethod ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("ui.web.reports.noPayments")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ui.field.method")}</TableHead>
                    <TableHead className="text-right">
                      {t("ui.web.reports.count")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("ui.field.amount")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.byPaymentMethod ?? []).map((row) => (
                    <TableRow key={row.method}>
                      <TableCell>
                        {t(`common.paymentMethod.${row.method}`)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.payments}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(row.amountCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-1">
          <span className="font-medium text-sm">
            {t("ui.web.reports.topItems")}
          </span>
          {(data?.topItems ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("ui.web.reports.noSales")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ui.field.name")}</TableHead>
                  <TableHead className="text-right">
                    {t("ui.field.quantity")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.reports.revenue")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topItems ?? []).map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(row.revenueCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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

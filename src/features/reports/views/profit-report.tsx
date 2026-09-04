"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import { PeriodPicker, startOfDaysAgo } from "../components/period-picker";
import { profitQueryOptions } from "../queries";

export function ProfitReport({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);

  const range = useMemo(
    () => ({ from: startOfDaysAgo(days), to: new Date().toISOString() }),
    [days],
  );

  const { data, isFetching } = useQuery(
    profitQueryOptions(businessId, range.from, range.to),
  );

  const totals = data?.totals;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PeriodPicker days={days} onChange={setDays} />
        <ExportMenu
          businessId={businessId}
          resource="reports/profit"
          params={range}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { key: "revenue", value: money(totals?.revenueCents ?? 0) },
          { key: "cost", value: money(totals?.costCents ?? 0) },
          { key: "profit", value: money(totals?.profitCents ?? 0) },
          { key: "margin", value: `${totals?.marginPercent ?? 0}%` },
        ].map((card) => (
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

      {(data?.uncosted ?? 0) > 0 && (
        <Badge variant="outline" className="w-fit">
          {t("ui.web.reports.uncosted", { count: data?.uncosted ?? 0 })}
        </Badge>
      )}

      {!isFetching && (data?.lines ?? []).length === 0 ? (
        <EmptyState
          title={t("ui.web.reports.noSales")}
          description={t("ui.web.reports.noSalesHint")}
        />
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
              <TableHead className="text-right">
                {t("ui.web.reports.cost")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.reports.profit")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.reports.margin")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.lines ?? []).map((line) => (
              <TableRow key={line.name}>
                <TableCell className="font-medium">{line.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {line.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(line.revenueCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(line.costCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(line.profitCents)}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    line.marginPercent < 0 ? "text-destructive" : ""
                  }`}
                >
                  {line.marginPercent}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

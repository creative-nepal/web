"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { StatCards } from "../components/stat-cards";
import { agingQueryOptions } from "../queries";

const BUCKETS = [
  { key: "currentCents", label: "bucket0to30" },
  { key: "days31To60Cents", label: "bucket31to60" },
  { key: "days61To90Cents", label: "bucket61to90" },
  { key: "over90Cents", label: "bucketOver90" },
] as const;

export function AgingReport({
  businessId,
  kind,
}: {
  businessId: string;
  kind: "receivables" | "payables";
}) {
  const { t } = useTranslation();
  const [asOf, setAsOf] = useState("");

  const { data, isFetching } = useQuery(
    agingQueryOptions(
      businessId,
      kind,
      asOf ? new Date(`${asOf}T23:59:59`).toISOString() : "",
    ),
  );

  const totals = data?.totals;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="agingAsOf">{t("ui.web.reports.asOf")}</Label>
            <Input
              id="agingAsOf"
              type="date"
              value={asOf}
              onChange={(event) => setAsOf(event.target.value)}
              className="w-44"
            />
          </div>
          {asOf && (
            <Button variant="ghost" onClick={() => setAsOf("")}>
              {t("ui.web.reports.asOfToday")}
            </Button>
          )}
          <p className="pb-2 text-muted-foreground text-sm">
            {t(`ui.web.reports.${kind}Hint`)} {t("ui.web.reports.asOfHint")}
          </p>
        </div>
        <ExportMenu
          businessId={businessId}
          resource={`reports/${kind}`}
          params={
            asOf
              ? { asOf: new Date(`${asOf}T23:59:59`).toISOString() }
              : undefined
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCards
          className="contents"
          stats={[
            ...BUCKETS.map((bucket) => ({
              key: bucket.key,
              label: t(`ui.web.reports.${bucket.label}`),
              value: money(totals?.[bucket.key] ?? 0),
            })),
            {
              key: "outstanding",
              label: t("ui.web.reports.outstanding"),
              value: money(totals?.totalCents ?? 0),
            },
          ]}
        />
      </div>

      {!isFetching && (data?.parties ?? []).length === 0 ? (
        <EmptyState
          title={t(`ui.web.reports.${kind}Empty`)}
          description={t("ui.web.reports.agingEmptyHint")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.name")}</TableHead>
              <TableHead>{t("ui.field.contact")}</TableHead>
              {BUCKETS.map((bucket) => (
                <TableHead key={bucket.key} className="text-right">
                  {t(`ui.web.reports.${bucket.label}`)}
                </TableHead>
              ))}
              <TableHead className="text-right">
                {t("ui.web.reports.outstanding")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.reports.oldest")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.parties ?? []).map((party) => (
              <TableRow key={party.partyId}>
                <TableCell className="font-medium">{party.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {party.phone ?? "—"}
                </TableCell>
                {BUCKETS.map((bucket) => (
                  <TableCell
                    key={bucket.key}
                    className="text-right tabular-nums"
                  >
                    {party[bucket.key] === 0 ? "—" : money(party[bucket.key])}
                  </TableCell>
                ))}
                <TableCell className="text-right font-medium tabular-nums">
                  {money(party.totalCents)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={party.oldestDays > 90 ? "destructive" : "outline"}
                  >
                    {t("ui.web.reports.days", { days: party.oldestDays })}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

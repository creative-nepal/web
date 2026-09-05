"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import { RecordWastageForm } from "../components/record-wastage-form";
import { wastageQueryOptions, wastageReportQueryOptions } from "../queries";

export function WastageView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const _queryClient = useQueryClient();
  const isRestaurant = business?.sector === "restaurant";

  const [_useDish, _setUseDish] = useState(false);
  const [_reason, _setReason] = useState<string>("spoilage");

  const { data: records } = useQuery(wastageQueryOptions(business?.id ?? ""));
  const { data: report } = useQuery(
    wastageReportQueryOptions(business?.id ?? ""),
  );

  if (!business) {
    return null;
  }

  const rows = records?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.wastage.title")}
        description={t("ui.web.wastage.description")}
        actions={<ExportMenu businessId={business.id} resource="wastage" />}
      />

      <RecordWastageForm businessId={business.id} isRestaurant={isRestaurant} />

      {(report?.entries ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("ui.web.wastage.totalCost")} · {t("ui.web.wastage.last30")}
            </CardTitle>
            <CardDescription className="font-medium text-destructive text-lg tabular-nums">
              {money(report?.totalCostCents ?? 0)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                {t("ui.web.wastage.byReason")}
              </span>
              {(report?.byReason ?? []).map((row) => (
                <span key={row.reason} className="text-sm tabular-nums">
                  {t(`common.wastageReason.${row.reason}`)} ·{" "}
                  {money(row.costCents)}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                {t("ui.web.wastage.worstItems")}
              </span>
              {(report?.topItems ?? []).slice(0, 5).map((row) => (
                <span key={row.itemName} className="text-sm tabular-nums">
                  {row.itemName} · {money(row.costCents)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.wastage.empty")}
          description={t("ui.web.wastage.emptyHint")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.when")}</TableHead>
              <TableHead>{t("ui.web.wastage.item")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.wastage.quantity")}
              </TableHead>
              <TableHead>{t("ui.web.wastage.reason")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.wastage.cost")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm">
                  {new Date(row.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {row.itemName}
                  {row.note && (
                    <span className="block text-muted-foreground text-xs">
                      {row.note}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.quantity}
                </TableCell>
                <TableCell>{t(`common.wastageReason.${row.reason}`)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(row.costCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

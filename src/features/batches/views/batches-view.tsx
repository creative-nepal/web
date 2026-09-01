"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { EXPIRY_WARNING_DAYS, EXPIRY_WINDOWS } from "../constants";
import { expiringBatchesQueryOptions } from "../queries";

export function BatchesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const [withinDays, setWithinDays] = useState(90);
  const { data, isFetching } = useQuery(
    expiringBatchesQueryOptions(business?.id ?? "", withinDays),
  );

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.batches.title")}
        description={t("ui.web.batches.description")}
        actions={
          <div className="flex gap-1">
            {EXPIRY_WINDOWS.map((window) => (
              <Button
                key={window}
                size="sm"
                variant={window === withinDays ? "default" : "outline"}
                onClick={() => setWithinDays(window)}
              >
                {window}d
              </Button>
            ))}
          </div>
        }
      />

      {!isFetching && (data?.data ?? []).length === 0 ? (
        <EmptyState
          title={t("ui.web.batches.empty")}
          description={`No batches expire within ${withinDays} days.`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.web.batches.batch")}</TableHead>
              <TableHead>{t("ui.web.batches.expiry")}</TableHead>
              <TableHead>{t("ui.web.batches.daysLeft")}</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">
                {t("ui.web.batches.cost")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">{batch.batchNo}</TableCell>
                <TableCell>{batch.expiryDate}</TableCell>
                <TableCell>
                  {batch.isExpired ? (
                    <Badge variant="destructive">
                      {t("ui.web.batches.expired")}
                    </Badge>
                  ) : batch.daysToExpiry <= EXPIRY_WARNING_DAYS ? (
                    <Badge variant="destructive">
                      {t("ui.web.batches.days", { count: batch.daysToExpiry })}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {t("ui.web.batches.days", { count: batch.daysToExpiry })}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {batch.qty}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(batch.costPriceCents / 100, "NPR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

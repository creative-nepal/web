"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { StatusBadge } from "@/components/status-badge";
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
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { CountSheet } from "../components/count-sheet";
import { OpenStockTakeDialog } from "../components/open-stock-take-dialog";
import { STOCK_TAKE_STATUS_VARIANTS } from "../constants";
import { stockTakeQueryOptions, stockTakesQueryOptions } from "../queries";

export function StockTakesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isFetching } = useQuery(
    stockTakesQueryOptions(business?.id ?? "", { limit: 20 }),
  );

  const { data: detail } = useQuery(
    stockTakeQueryOptions(business?.id ?? "", selectedId),
  );

  if (!business) {
    return null;
  }

  const stockTakes = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.stockTakes.title")}
        description={t("ui.web.stockTakes.description")}
        actions={
          <Can permission={{ stocktake: ["open"] }}>
            <Button onClick={() => setDialogOpen(true)}>
              {t("ui.web.stockTakes.open")}
            </Button>
          </Can>
        }
      />

      {!isFetching && stockTakes.length === 0 ? (
        <EmptyState
          title={t("ui.web.stockTakes.empty")}
          description={t("ui.web.stockTakes.emptyHint")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.web.stockTakes.reference")}</TableHead>
              <TableHead>{t("ui.field.status")}</TableHead>
              <TableHead>{t("ui.web.stockTakes.note")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockTakes.map((stockTake) => (
              <TableRow key={stockTake.id}>
                <TableCell className="font-medium">
                  {stockTake.reference}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    value={stockTake.status}
                    variants={STOCK_TAKE_STATUS_VARIANTS}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {stockTake.note ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSelectedId(
                        selectedId === stockTake.id ? null : stockTake.id,
                      )
                    }
                  >
                    {t("ui.web.stockTakes.countSheet")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {detail && (
        <CountSheet
          businessId={business.id}
          detail={detail}
          onClosed={() => setSelectedId(null)}
        />
      )}

      <OpenStockTakeDialog
        businessId={business.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onOpened={setSelectedId}
      />
    </div>
  );
}

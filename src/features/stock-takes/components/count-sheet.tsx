"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { STOCK_TAKE_STATUS_VARIANTS } from "../constants";
import { stockTakeQueryKeys } from "../queries";
import { cancelStockTake, completeStockTake, recordCounts } from "../services";
import type { StockTakeDetail } from "../types";

export function CountSheet({
  businessId,
  detail,
  onClosed,
}: {
  businessId: string;
  detail: StockTakeDetail;
  onClosed: () => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isOpen = detail.status === "open";

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: stockTakeQueryKeys.all });

  const save = useMutation({
    mutationFn: () =>
      recordCounts(
        businessId,
        detail.id,
        Object.entries(drafts)
          .filter(([, value]) => value !== "")
          .map(([lineId, value]) => ({
            lineId,
            countedQty: Number(value),
          })),
      ),
    onSuccess: () => {
      setDrafts({});
      void invalidate();
      toast.success(t("ui.web.stockTakes.countsSaved"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const complete = useMutation({
    mutationFn: () => completeStockTake(businessId, detail.id),
    onSuccess: (outcome) => {
      void invalidate();
      toast.success(
        t("ui.web.stockTakes.completed", { applied: outcome.appliedLines }),
      );
      onClosed();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const cancel = useMutation({
    mutationFn: () => cancelStockTake(businessId, detail.id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("ui.web.stockTakes.cancelled"));
      onClosed();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const pendingDrafts = Object.values(drafts).filter(
    (value) => value !== "",
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2">
              {detail.reference}
              <StatusBadge
                value={detail.status}
                variants={STOCK_TAKE_STATUS_VARIANTS}
              />
            </CardTitle>
            <CardDescription>
              {t("ui.web.stockTakes.progress", {
                counted: detail.countedLines,
                total: detail.lines.length,
              })}
              {detail.varianceLines > 0 &&
                ` · ${t("ui.web.stockTakes.varianceLines", {
                  count: detail.varianceLines,
                })}`}
            </CardDescription>
          </div>
          {isOpen && (
            <div className="flex gap-2">
              <Can permission={{ stocktake: ["count"] }}>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingDrafts === 0 || save.isPending}
                  onClick={() => save.mutate()}
                >
                  {t("ui.web.stockTakes.saveCounts")}
                </Button>
              </Can>
              <Can permission={{ stocktake: ["complete"] }}>
                <Button
                  size="sm"
                  disabled={
                    detail.countedLines < detail.lines.length ||
                    complete.isPending
                  }
                  onClick={() => setConfirmComplete(true)}
                >
                  {t("ui.web.stockTakes.complete")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmCancel(true)}
                >
                  {t("ui.web.stockTakes.cancel")}
                </Button>
              </Can>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.web.stockTakes.product")}</TableHead>
              <TableHead>{t("ui.web.stockTakes.batch")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.stockTakes.systemQty")}
              </TableHead>
              <TableHead className="w-32 text-right">
                {t("ui.web.stockTakes.countedQty")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.stockTakes.variance")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.lines.map((line) => {
              const draft = drafts[line.id];
              const counted =
                draft !== undefined && draft !== ""
                  ? Number(draft)
                  : line.countedQty;
              const variance =
                counted === null ? null : counted - line.systemQty;

              return (
                <TableRow key={line.id}>
                  <TableCell className="font-medium">
                    {line.productName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {line.batchNo ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {line.systemQty}
                  </TableCell>
                  <TableCell className="text-right">
                    {isOpen ? (
                      <Input
                        type="number"
                        min={0}
                        step="0.001"
                        className="h-8 text-right"
                        value={draft ?? line.countedQty ?? ""}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [line.id]: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      <span className="tabular-nums">
                        {line.countedQty ?? "—"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className={
                      variance === null || variance === 0
                        ? "text-muted-foreground text-right tabular-nums"
                        : "text-right font-medium tabular-nums text-destructive"
                    }
                  >
                    {variance === null
                      ? t("ui.web.stockTakes.uncounted")
                      : variance > 0
                        ? `+${variance}`
                        : variance}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <ConfirmDialog
        open={confirmComplete}
        onOpenChange={setConfirmComplete}
        title={t("ui.web.stockTakes.complete")}
        description={t("ui.web.stockTakes.completeConfirm", {
          count: detail.varianceLines,
        })}
        onConfirm={() => complete.mutate()}
      />
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t("ui.web.stockTakes.cancel")}
        description={t("ui.web.stockTakes.cancelConfirm")}
        variant="destructive"
        onConfirm={() => cancel.mutate()}
      />
    </Card>
  );
}

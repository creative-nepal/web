"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { money } from "@/lib/money";
import { cashQueryKeys } from "../queries";
import { closeSession } from "../services";
import type { CashSessionSummary } from "../types";

export function CloseTillDialog({
  businessId,
  summary,
  open,
  onOpenChange,
}: {
  businessId: string;
  summary: CashSessionSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");

  const countedCents =
    counted === "" ? null : Math.round(Number(counted) * 100);
  const variance =
    countedCents === null ? null : countedCents - summary.expectedCashCents;

  const close = useMutation({
    mutationFn: () =>
      closeSession(businessId, summary.session.id, countedCents ?? 0, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cashQueryKeys.all });
      setCounted("");
      setNote("");
      onOpenChange(false);
      toast.success(t("ui.web.cash.closed"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ui.web.cash.closeTitle")}</DialogTitle>
          <DialogDescription>
            {t("ui.web.cash.closeHint", {
              expected: money(summary.expectedCashCents),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="counted">{t("ui.web.cash.counted")}</Label>
            <Input
              id="counted"
              type="number"
              min={0}
              value={counted}
              onChange={(event) => setCounted(event.target.value)}
            />
          </div>

          {variance !== null && (
            <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span className="text-muted-foreground">
                {t("ui.web.cash.variance")}
              </span>
              <span
                className={
                  variance === 0
                    ? "font-medium tabular-nums"
                    : "font-medium text-destructive tabular-nums"
                }
              >
                {variance === 0
                  ? t("ui.web.cash.balanced")
                  : `${money(Math.abs(variance))} ${
                      variance < 0
                        ? t("ui.web.cash.short")
                        : t("ui.web.cash.over")
                    }`}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="closeNote">{t("ui.web.cash.reason")}</Label>
            <Textarea
              id="closeNote"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={counted === "" || close.isPending}
            onClick={() => close.mutate()}
          >
            {t("ui.web.cash.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { restaurantQueryKeys } from "../queries";
import {
  type BillSplitMode,
  billTable,
  type RestaurantTable,
} from "../services";

const MODES: BillSplitMode[] = ["items", "equal", "percentage"];

function parsePercentages(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
}

export function BillDialog({
  businessId,
  table,
  onOpenChange,
}: {
  businessId: string;
  table: RestaurantTable | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<BillSplitMode>("items");
  const [ways, setWays] = useState(2);
  const [percentages, setPercentages] = useState("50, 50");

  const parsed = parsePercentages(percentages);
  const percentageTotal = parsed.reduce((sum, share) => sum + share, 0);

  const bill = useMutation({
    mutationFn: () =>
      billTable(businessId, table?.id ?? "", {
        mode,
        ...(mode === "equal" ? { ways } : {}),
        ...(mode === "percentage" ? { percentages: parsed } : {}),
      }),
    onSuccess: (invoices) => {
      void queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all });
      toast.success(
        t("ui.web.restaurant.billIssued", { count: invoices.length }),
      );
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.web.restaurant.billFailed"),
      ),
  });

  const canSubmit =
    mode === "items" ||
    (mode === "equal" && ways >= 2) ||
    (mode === "percentage" &&
      parsed.length >= 2 &&
      parsed.every((share) => share > 0) &&
      Math.round(percentageTotal * 100) === 10000);

  return (
    <ContentDialog
      open={table !== null}
      onOpenChange={onOpenChange}
      title={t("ui.web.restaurant.billTitle", {
        tableNo: table?.tableNo ?? "",
      })}
      description={t("ui.web.restaurant.billDescription")}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("ui.action.cancel")}
          </Button>
          <Button
            disabled={!canSubmit || bill.isPending}
            onClick={() => bill.mutate()}
          >
            {t("ui.web.restaurant.billTable")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-1">
          {MODES.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={mode === option ? "default" : "outline"}
              onClick={() => setMode(option)}
            >
              {t(`ui.web.restaurant.split.${option}`)}
            </Button>
          ))}
        </div>

        {mode === "items" && (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.restaurant.split.itemsHint")}
          </p>
        )}

        {mode === "equal" && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="ways">{t("ui.web.restaurant.split.ways")}</Label>
            <Input
              id="ways"
              type="number"
              min={2}
              max={50}
              value={ways}
              onChange={(event) => setWays(Number(event.target.value))}
            />
            <span className="text-muted-foreground text-xs">
              {t("ui.web.restaurant.split.equalHint")}
            </span>
          </div>
        )}

        {mode === "percentage" && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="percentages">
              {t("ui.web.restaurant.split.percentages")}
            </Label>
            <Input
              id="percentages"
              value={percentages}
              onChange={(event) => setPercentages(event.target.value)}
              placeholder="40, 35, 25"
            />
            <span
              className={
                Math.round(percentageTotal * 100) === 10000
                  ? "text-muted-foreground text-xs"
                  : "text-destructive text-xs"
              }
            >
              {t("ui.web.restaurant.split.percentageTotal", {
                total: percentageTotal.toFixed(2).replace(/\.00$/, ""),
              })}
            </span>
          </div>
        )}
      </div>
    </ContentDialog>
  );
}

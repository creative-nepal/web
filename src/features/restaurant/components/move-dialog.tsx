"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { restaurantQueryKeys } from "../queries";
import { mergeTables, type RestaurantTable, transferTable } from "../services";

type MoveMode = "transfer" | "merge";

export function MoveDialog({
  businessId,
  table,
  tables,
  onOpenChange,
}: {
  businessId: string;
  table: RestaurantTable | null;
  tables: RestaurantTable[];
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<MoveMode>("transfer");
  const [toTableId, setToTableId] = useState("");
  const [sources, setSources] = useState<string[]>([]);

  const others = tables.filter((entry) => entry.id !== table?.id);
  const occupiedOthers = others.filter((entry) => entry.status === "occupied");

  const done = (result: { ordersMoved: number; tableNo: string }) => {
    void queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all });
    toast.success(
      t("ui.web.restaurant.moveDone", {
        count: result.ordersMoved,
        tableNo: result.tableNo,
      }),
    );
    setToTableId("");
    setSources([]);
    onOpenChange(false);
  };

  const fail = (error: unknown) =>
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? t("ui.error.generic"),
    );

  const transfer = useMutation({
    mutationFn: () => transferTable(businessId, table?.id ?? "", toTableId),
    onSuccess: done,
    onError: fail,
  });

  const merge = useMutation({
    mutationFn: () => mergeTables(businessId, table?.id ?? "", sources),
    onSuccess: done,
    onError: fail,
  });

  return (
    <ContentDialog
      open={table !== null}
      onOpenChange={onOpenChange}
      title={t("ui.web.restaurant.moveTitle", {
        tableNo: table?.tableNo ?? "",
      })}
      description={t("ui.web.restaurant.moveDescription")}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("ui.action.cancel")}
          </Button>
          <Button
            disabled={
              mode === "transfer"
                ? !toTableId || transfer.isPending
                : sources.length === 0 || merge.isPending
            }
            onClick={() =>
              mode === "transfer" ? transfer.mutate() : merge.mutate()
            }
          >
            {t(`ui.web.restaurant.move.${mode}`)}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={mode === "transfer" ? "default" : "outline"}
            onClick={() => setMode("transfer")}
          >
            {t("ui.web.restaurant.move.transfer")}
          </Button>
          <Button
            size="sm"
            variant={mode === "merge" ? "default" : "outline"}
            onClick={() => setMode("merge")}
          >
            {t("ui.web.restaurant.move.merge")}
          </Button>
        </div>

        {mode === "transfer" ? (
          <div className="flex flex-col gap-1">
            <Label htmlFor="toTable">
              {t("ui.web.restaurant.move.moveTo")}
            </Label>
            <NativeSelect
              id="toTable"
              value={toTableId}
              onChange={(event) => setToTableId(event.target.value)}
            >
              <NativeSelectOption value="">—</NativeSelectOption>
              {others
                .filter((entry) => entry.status !== "billed")
                .map((entry) => (
                  <NativeSelectOption key={entry.id} value={entry.id}>
                    {entry.tableNo} ({entry.seats})
                  </NativeSelectOption>
                ))}
            </NativeSelect>
            <span className="text-muted-foreground text-xs">
              {t("ui.web.restaurant.move.transferHint")}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label>{t("ui.web.restaurant.move.mergeFrom")}</Label>
            {occupiedOthers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("ui.web.restaurant.move.nothingToMerge")}
              </p>
            ) : (
              occupiedOthers.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                >
                  <Checkbox
                    id={`merge-${entry.id}`}
                    checked={sources.includes(entry.id)}
                    onCheckedChange={(checked) =>
                      setSources((current) =>
                        checked
                          ? [...current, entry.id]
                          : current.filter((id) => id !== entry.id),
                      )
                    }
                  />
                  <Label htmlFor={`merge-${entry.id}`}>{entry.tableNo}</Label>
                </div>
              ))
            )}
            <span className="text-muted-foreground text-xs">
              {t("ui.web.restaurant.move.mergeHint")}
            </span>
          </div>
        )}
      </div>
    </ContentDialog>
  );
}

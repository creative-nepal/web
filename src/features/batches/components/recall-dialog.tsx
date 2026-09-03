"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { batchQueryKeys } from "../queries";
import { type Batch, getRecallReport, quarantineBatch } from "../services";

export function RecallDialog({
  businessId,
  batch,
  onOpenChange,
}: {
  businessId: string;
  batch: Batch | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  const { data } = useQuery({
    queryKey: ["recall", businessId, batch?.id],
    queryFn: () => getRecallReport(businessId, batch?.id ?? ""),
    enabled: Boolean(businessId && batch),
  });

  const quarantine = useMutation({
    mutationFn: () => quarantineBatch(businessId, batch?.id ?? "", note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: batchQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["recall"] });
      toast.success(t("ui.web.batches.quarantined"));
      setNote("");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={batch !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("ui.web.batches.recallTitle", { batch: batch?.batchNo ?? "" })}
          </DialogTitle>
          <DialogDescription>
            {t("ui.web.batches.recallHint")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {t("ui.web.batches.remaining")}
            </span>
            <span className="font-medium tabular-nums">
              {data?.remainingQty ?? 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {t("ui.web.batches.dispensed")}
            </span>
            <span className="font-medium tabular-nums">
              {data?.dispensedQty ?? 0}
            </span>
          </div>
        </div>

        {(data?.dispenses.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.batches.noDispenses")}
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ui.web.batches.soldAt")}</TableHead>
                  <TableHead>{t("ui.web.batches.soldTo")}</TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.batches.quantity")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.batches.invoice")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.dispenses ?? []).map((dispense) => (
                  <TableRow key={dispense.orderId}>
                    <TableCell className="text-sm">
                      {new Date(dispense.soldAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {dispense.customerName ? (
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {dispense.customerName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {dispense.customerPhone ??
                              dispense.customerEmail ??
                              ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {t("ui.web.batches.walkIn")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {dispense.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {dispense.invoiceNumber
                        ? `#${dispense.invoiceNumber}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {(data?.remainingQty ?? 0) > 0 && (
          <Can permission={{ recall: ["quarantine"] }}>
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="recallNote">
                  {t("ui.web.batches.recallNote")}
                </Label>
                <Input
                  id="recallNote"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
              <Button
                variant="destructive"
                disabled={quarantine.isPending}
                onClick={() => setConfirming(true)}
              >
                {t("ui.web.batches.quarantine")}
              </Button>
            </div>
          </Can>
        )}

        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title={t("ui.web.batches.quarantine")}
          description={t("ui.web.batches.quarantineConfirm", {
            remaining: data?.remainingQty ?? 0,
          })}
          variant="destructive"
          onConfirm={() => quarantine.mutate()}
        />
      </DialogContent>
    </Dialog>
  );
}

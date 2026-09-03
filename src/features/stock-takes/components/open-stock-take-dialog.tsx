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
import { stockTakeQueryKeys } from "../queries";
import { openStockTake } from "../services";

export function OpenStockTakeDialog({
  businessId,
  open,
  onOpenChange,
  onOpened,
}: {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpened: (stockTakeId: string) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      openStockTake(businessId, {
        reference,
        ...(note ? { note } : {}),
      }),
    onSuccess: (detail) => {
      void queryClient.invalidateQueries({ queryKey: stockTakeQueryKeys.all });
      setReference("");
      setNote("");
      onOpenChange(false);
      onOpened(detail.id);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ui.web.stockTakes.openTitle")}</DialogTitle>
          <DialogDescription>
            {t("ui.web.stockTakes.openHint")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="reference">
              {t("ui.web.stockTakes.reference")}
            </Label>
            <Input
              id="reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder={t("ui.web.stockTakes.referencePlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="note">{t("ui.web.stockTakes.note")}</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!reference.trim() || submit.isPending}
            onClick={() => submit.mutate()}
          >
            {t("ui.web.stockTakes.open")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { money, parseAmountToCents } from "@/lib/money";
import { invoiceQueryKeys } from "../queries";
import { issueCreditNote } from "../services";
import type { Invoice } from "../types";

export function CreditNoteDialog({
  businessId,
  invoice,
  onClose,
}: {
  businessId: string;
  invoice: Invoice;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState(
    (invoice.creditableSubtotalCents / 100).toFixed(2),
  );
  const [reason, setReason] = useState("");

  const amountCents = amount.trim() === "" ? null : parseAmountToCents(amount);
  const overCredit =
    amountCents !== null && amountCents > invoice.creditableSubtotalCents;

  const creditNote = useMutation({
    mutationFn: () =>
      issueCreditNote(businessId, invoice.id, {
        subtotalCents: amountCents ?? 0,
        reason: reason.trim(),
      }),
    onSuccess: (note) => {
      void queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      toast.success(
        t("ui.web.invoices.creditNoteIssued", { number: note.invoiceNumber }),
      );
      onClose();
    },
    onError: (error) =>
      toast.error(
        apiErrorMessage(error, t("ui.web.invoices.creditNoteFailed")),
      ),
  });

  const exhausted = invoice.creditableSubtotalCents <= 0;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ui.web.invoices.creditNoteTitle")}</DialogTitle>
          <DialogDescription>
            {exhausted
              ? t("ui.web.invoices.noCreditableAmount")
              : t("ui.web.invoices.creditable", {
                  amount: money(invoice.creditableSubtotalCents),
                })}
          </DialogDescription>
        </DialogHeader>

        {!exhausted && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="creditAmount">{t("ui.field.amount")}</Label>
              <Input
                id="creditAmount"
                inputMode="decimal"
                value={amount}
                aria-invalid={amountCents === null || overCredit}
                onChange={(event) => setAmount(event.target.value)}
              />
              {overCredit && (
                <p className="text-destructive text-xs">
                  {t("ui.web.invoices.creditable", {
                    amount: money(invoice.creditableSubtotalCents),
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="creditReason">
                {t("ui.web.invoices.creditNoteReason")}
              </Label>
              <Textarea
                id="creditReason"
                rows={2}
                value={reason}
                aria-invalid={!reason.trim()}
                onChange={(event) => setReason(event.target.value)}
              />
              {!reason.trim() && (
                <p className="text-destructive text-xs">
                  {t("ui.web.invoices.creditNoteReasonRequired")}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={
              exhausted ||
              amountCents === null ||
              amountCents === 0 ||
              overCredit ||
              !reason.trim() ||
              creditNote.isPending
            }
            onClick={() => creditNote.mutate()}
          >
            {t("ui.web.invoices.issueCreditNote")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

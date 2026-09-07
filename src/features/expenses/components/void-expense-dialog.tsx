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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { expenseQueryKeys } from "../queries";
import { voidExpense } from "../services";
import type { Expense } from "../types";

export function VoidExpenseDialog({
  businessId,
  expense,
  onClose,
}: {
  businessId: string;
  expense: Expense;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const discard = useMutation({
    mutationFn: () => voidExpense(businessId, expense.id, reason.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["cash"] });
      toast.success(t("ui.web.expenses.voided"));
      onClose();
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t("ui.error.generic"))),
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ui.web.expenses.voidTitle")}</DialogTitle>
          <DialogDescription>{t("ui.web.expenses.voidHint")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          <Label htmlFor="voidReason">{t("ui.web.expenses.voidReason")}</Label>
          <Textarea
            id="voidReason"
            rows={2}
            value={reason}
            aria-invalid={!reason.trim()}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={!reason.trim() || discard.isPending}
            onClick={() => discard.mutate()}
          >
            {t("ui.action.void")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

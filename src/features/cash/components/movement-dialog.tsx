"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { cashQueryKeys } from "../queries";
import { addMovement } from "../services";

export function MovementDialog({
  businessId,
  sessionId,
  open,
  onOpenChange,
}: {
  businessId: string;
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [direction, setDirection] = useState<"in" | "out">("out");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const save = useMutation({
    mutationFn: () =>
      addMovement(businessId, sessionId, {
        direction,
        amountCents: Math.round(Number(amount) * 100),
        reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cashQueryKeys.all });
      setAmount("");
      setReason("");
      onOpenChange(false);
      toast.success(t("ui.web.cash.movementAdded"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ui.web.cash.addMovement")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="direction">{t("ui.web.cash.direction")}</Label>
            <Select
              value={direction}
              onValueChange={(value) =>
                setDirection((value as "in" | "out") ?? "out")
              }
            >
              <SelectTrigger id="direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="out">{t("ui.web.cash.out")}</SelectItem>
                <SelectItem value="in">{t("ui.web.cash.in")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="amount">{t("ui.web.cash.amount")}</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="reason">{t("ui.web.cash.reason")}</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={amount === "" || !reason.trim() || save.isPending}
            onClick={() => save.mutate()}
          >
            {t("ui.action.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

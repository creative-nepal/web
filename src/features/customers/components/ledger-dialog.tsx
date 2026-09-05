"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Button } from "@/components/ui/button";
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
import { money } from "@/lib/money";
import { customerQueryKeys, ledgerQueryOptions } from "../queries";
import { recordPayment } from "../services";
import type { Customer } from "../types";

export function LedgerDialog({
  businessId,
  customer,
  onClose,
}: {
  businessId: string;
  customer: Customer;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  const { data } = useQuery(ledgerQueryOptions(businessId, customer.id));

  const pay = useMutation({
    mutationFn: () =>
      recordPayment(businessId, customer.id, Math.round(Number(amount) * 100)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      setAmount("");
      toast.success(t("ui.web.customers.paymentRecorded"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`${t("ui.web.customers.ledger")} — ${customer.name}`}
      description={`${t("ui.web.customers.balance")}: ${money(customer.balanceCents)}`}
    >
      <div className="flex flex-col gap-4">
        {customer.balanceCents > 0 && (
          <Can permission={{ invoice: ["issue"] }}>
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="pay-amount">
                  {t("ui.web.customers.recordPayment")}
                </Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
              <Button
                disabled={!amount || pay.isPending}
                onClick={() => pay.mutate()}
              >
                {t("ui.web.customers.recordPayment")}
              </Button>
            </div>
          </Can>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.when")}</TableHead>
              <TableHead>{t("ui.field.action")}</TableHead>
              <TableHead className="text-right">
                {t("ui.field.amount")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.customers.balance")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground text-xs">
                  {entry.createdAt.slice(0, 10)}
                </TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(entry.amountCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(entry.balanceAfterCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ContentDialog>
  );
}

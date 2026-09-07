"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Amount } from "@/components/composed/amount";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/features/business/components/can";
import { TENDER_METHODS, type TenderMethod } from "@/features/cash/types";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { money, parseAmountToCents } from "@/lib/money";
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
  const [method, setMethod] = useState<TenderMethod>("cash");

  const { data } = useQuery(ledgerQueryOptions(businessId, customer.id));

  const amountCents = amount.trim() === "" ? null : parseAmountToCents(amount);
  const overPayment =
    amountCents !== null && amountCents > customer.balanceCents;

  const pay = useMutation({
    mutationFn: () =>
      recordPayment(businessId, customer.id, {
        amountCents: amountCents ?? 0,
        method,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["cash"] });
      setAmount("");
      toast.success(t("ui.web.customers.paymentRecorded"));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t("ui.error.generic"))),
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
          <Can permission={{ cash: ["take-payment"] }}>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="pay-amount">
                  {t("ui.web.customers.recordPayment")}
                </Label>
                <Input
                  id="pay-amount"
                  inputMode="decimal"
                  className="w-36"
                  value={amount}
                  aria-invalid={
                    (amount.trim() !== "" && amountCents === null) ||
                    overPayment
                  }
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pay-method">
                  {t("ui.web.customers.paymentMethod")}
                </Label>
                <Select
                  value={method}
                  onValueChange={(value) => setMethod(value as TenderMethod)}
                >
                  <SelectTrigger id="pay-method" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TENDER_METHODS.map((entry) => (
                      <SelectItem key={entry} value={entry}>
                        {t(`common.paymentMethod.${entry}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                disabled={
                  amountCents === null ||
                  amountCents === 0 ||
                  overPayment ||
                  pay.isPending
                }
                onClick={() => pay.mutate()}
              >
                {t("ui.web.customers.recordPayment")}
              </Button>
            </div>
          </Can>
        )}

        {amount.trim() !== "" && amountCents === null && (
          <p className="text-destructive text-sm">
            {t("ui.web.customers.paymentAmountInvalid")}
          </p>
        )}

        {overPayment && (
          <p className="text-destructive text-sm">
            {t("ui.web.customers.overPayment", {
              balance: money(customer.balanceCents),
            })}
          </p>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.when")}</TableHead>
              <TableHead>{t("ui.field.action")}</TableHead>
              <TableHead>{t("ui.field.method")}</TableHead>
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
                  {new Date(entry.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {t(`ui.web.customers.ledgerType.${entry.type}`)}
                    {entry.cashSessionId && (
                      <Badge variant="outline">
                        {t("ui.web.expenses.fromTill")}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {entry.method
                    ? t(`common.paymentMethod.${entry.method}`)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Amount cents={entry.amountCents} tone="signed" />
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

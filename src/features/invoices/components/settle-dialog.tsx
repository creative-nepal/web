"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Amount } from "@/components/composed/amount";
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
import { settleInvoice } from "@/features/cash/services";
import { TENDER_METHODS, type TenderMethod } from "@/features/cash/types";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { money, parseAmountToCents } from "@/lib/money";
import { invoicePaymentsQueryOptions, invoiceQueryKeys } from "../queries";
import type { Invoice } from "../types";

interface Line {
  key: string;
  method: TenderMethod;
  amount: string;
  reference: string;
}

function newLine(amount = ""): Line {
  return {
    key: crypto.randomUUID(),
    method: "cash",
    amount,
    reference: "",
  };
}

export function SettleDialog({
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

  const [lines, setLines] = useState<Line[]>(() => [
    newLine((invoice.dueCents / 100).toFixed(2)),
  ]);

  const { data: payments } = useQuery(
    invoicePaymentsQueryOptions(businessId, invoice.id),
  );

  const parsed = lines.map((line) => ({
    line,
    cents: line.amount.trim() === "" ? null : parseAmountToCents(line.amount),
  }));

  const invalid = parsed.some((entry) => entry.cents === null);
  const tenderedCents = parsed.reduce(
    (total, entry) => total + (entry.cents ?? 0),
    0,
  );
  const overTender = tenderedCents > invoice.dueCents;

  const settle = useMutation({
    mutationFn: () =>
      settleInvoice(
        businessId,
        invoice.id,
        parsed.map((entry) => ({
          method: entry.line.method,
          amountCents: entry.cents ?? 0,
          ...(entry.line.reference.trim()
            ? { reference: entry.line.reference.trim() }
            : {}),
        })),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["cash"] });
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(t("ui.web.invoices.settled"));
      onClose();
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t("ui.web.invoices.settleFailed"))),
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t("ui.web.invoices.settleTitle", {
              number: invoice.invoiceNumber,
            })}
          </DialogTitle>
          <DialogDescription>
            {t("ui.web.invoices.settleHint", {
              due: money(invoice.dueCents),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {parsed.map(({ line, cents }, index) => (
            <div key={line.key} className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor={`method-${line.key}`}>
                  {t("ui.web.cash.method")}
                </Label>
                <Select
                  value={line.method}
                  onValueChange={(value) =>
                    setLines((current) =>
                      current.map((entry, i) =>
                        i === index
                          ? { ...entry, method: value as TenderMethod }
                          : entry,
                      ),
                    )
                  }
                >
                  <SelectTrigger id={`method-${line.key}`} className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TENDER_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {t(`common.paymentMethod.${method}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor={`amount-${line.key}`}>
                  {t("ui.field.amount")}
                </Label>
                <Input
                  id={`amount-${line.key}`}
                  inputMode="decimal"
                  className="w-32"
                  value={line.amount}
                  aria-invalid={cents === null}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((entry, i) =>
                        i === index
                          ? { ...entry, amount: event.target.value }
                          : entry,
                      ),
                    )
                  }
                />
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor={`reference-${line.key}`}>
                  {t("ui.web.cash.reference")}
                </Label>
                <Input
                  id={`reference-${line.key}`}
                  value={line.reference}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((entry, i) =>
                        i === index
                          ? { ...entry, reference: event.target.value }
                          : entry,
                      ),
                    )
                  }
                />
              </div>

              {lines.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setLines((current) => current.filter((_, i) => i !== index))
                  }
                >
                  {t("ui.web.invoices.removePaymentLine")}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={lines.length >= 10}
            onClick={() => setLines((current) => [...current, newLine()])}
          >
            {t("ui.web.invoices.addPaymentLine")}
          </Button>

          <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span className="text-muted-foreground">
              {t("ui.web.invoices.tendered")}
            </span>
            <span
              className={
                overTender
                  ? "font-medium text-destructive tabular-nums"
                  : "font-medium tabular-nums"
              }
            >
              {money(tenderedCents)}
            </span>
          </div>

          {overTender && (
            <p className="text-destructive text-sm">
              {t("ui.web.invoices.overTender", {
                due: money(invoice.dueCents),
              })}
            </p>
          )}

          {(payments?.length ?? 0) > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ui.field.when")}</TableHead>
                  <TableHead>{t("ui.web.cash.method")}</TableHead>
                  <TableHead>{t("ui.web.cash.reference")}</TableHead>
                  <TableHead className="text-right">
                    {t("ui.field.amount")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payments ?? []).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">
                      {new Date(payment.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {t(`common.paymentMethod.${payment.method}`)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {payment.reference ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Amount cents={payment.amountCents} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={
              invalid || overTender || tenderedCents === 0 || settle.isPending
            }
            onClick={() => settle.mutate()}
          >
            {t("ui.action.settle")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

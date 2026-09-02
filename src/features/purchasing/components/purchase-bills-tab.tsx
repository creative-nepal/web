"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useSupplierNames } from "../hooks/use-supplier-names";
import { billsQueryOptions, purchasingQueryKeys } from "../queries";
import { recordPayment } from "../services";
import { DebitNoteDialog } from "./debit-note-dialog";

export function PurchaseBillsTab({ businessId }: { businessId: string }) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const supplierName = useSupplierNames(businessId);
  const [debitNoteFor, setDebitNoteFor] = useState<{
    id: string;
    billNumber: string;
  } | null>(null);
  const { data: bills } = useQuery(billsQueryOptions(businessId));

  const pay = useMutation({
    mutationFn: ({
      billId,
      amountCents,
    }: {
      billId: string;
      amountCents: number;
    }) => recordPayment(businessId, billId, amountCents),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchasingQueryKeys.all });
      toast.success(t("ui.web.purchasing.paymentRecorded"));
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic");
      toast.error(message);
    },
  });

  const rows = bills?.data ?? [];

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t("ui.web.purchasing.billsEmptyTitle")}
        description={t("ui.web.purchasing.billsEmptyBody")}
      />
    );
  }

  return (
    <>
      {debitNoteFor && (
        <DebitNoteDialog
          businessId={businessId}
          billId={debitNoteFor.id}
          billNumber={debitNoteFor.billNumber}
          onClose={() => setDebitNoteFor(null)}
        />
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("ui.web.purchasing.bill")}</TableHead>
            <TableHead>{t("ui.field.supplier")}</TableHead>
            <TableHead className="text-right">{t("ui.field.total")}</TableHead>
            <TableHead className="text-right">
              {t("ui.web.purchasing.tdsWithheld")}
            </TableHead>
            <TableHead className="text-right">
              {t("ui.web.purchasing.payable")}
            </TableHead>
            <TableHead>{t("ui.field.status")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((bill) => {
            const payable = bill.totalCents - bill.tdsAmountCents;
            const outstanding = payable - bill.paidCents;

            return (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">
                  {bill.billNumber}
                  <span className="block text-muted-foreground text-xs">
                    {bill.billDate}
                  </span>
                </TableCell>
                <TableCell>{supplierName(bill.supplierId)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(bill.totalCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {bill.tdsAmountCents > 0
                    ? `${money(bill.tdsAmountCents)} (${bill.tdsRateBasisPoints / 100}%)`
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(payable)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={bill.status === "paid" ? "default" : "outline"}
                  >
                    {t(`common.status.${bill.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {outstanding > 0 && (
                      <Can permission={{ product: ["update"] }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            pay.mutate({
                              billId: bill.id,
                              amountCents: outstanding,
                            })
                          }
                        >
                          {t("ui.web.purchasing.pay")} {money(outstanding)}
                        </Button>
                      </Can>
                    )}
                    <Can permission={{ invoice: ["credit-note"] }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDebitNoteFor({
                            id: bill.id,
                            billNumber: bill.billNumber,
                          })
                        }
                      >
                        {t("ui.web.purchasing.issueDebitNote")}
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}

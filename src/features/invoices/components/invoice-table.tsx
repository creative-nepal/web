"use client";

import { StatusBadge } from "@/components/status-badge";
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
import {
  INVOICE_SETTLEMENT_VARIANTS,
  INVOICE_STATUS_VARIANTS,
} from "../constants";
import type { Invoice } from "../types";

interface InvoiceTableProps {
  invoices: Invoice[];
  onPrint: (invoice: Invoice) => void;
  onCredit: (invoice: Invoice) => void;
  onSettle: (invoice: Invoice) => void;
  onAudit: (invoice: Invoice) => void;
}

export function InvoiceTable({
  invoices,
  onPrint,
  onCredit,
  onSettle,
  onAudit,
}: InvoiceTableProps) {
  const { t } = useTranslation();

  const statusLabels = {
    issued: t("ui.web.invoices.status.issued"),
    credit_note: t("ui.web.invoices.status.credit_note"),
    voided: t("ui.web.invoices.status.voided"),
  };

  const settlementLabels = {
    unpaid: t("ui.web.invoices.settlement.unpaid"),
    partial: t("ui.web.invoices.settlement.partial"),
    paid: t("ui.web.invoices.settlement.paid"),
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("ui.field.invoice")}</TableHead>
          <TableHead>{t("common.invoice.dateBs")}</TableHead>
          <TableHead>{t("ui.field.buyer")}</TableHead>
          <TableHead>{t("ui.field.status")}</TableHead>
          <TableHead className="text-right">
            {t("common.invoice.vat")}
          </TableHead>
          <TableHead className="text-right">{t("ui.field.total")}</TableHead>
          <TableHead className="text-right">
            {t("ui.web.invoices.due")}
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium tabular-nums">
              #{invoice.invoiceNumber}
              {invoice.printedCount > 1 && (
                <Badge variant="destructive" className="ml-2">
                  {t("common.invoice.copy")}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-sm">{invoice.issuedAtBs}</TableCell>
            <TableCell className="text-sm">
              {invoice.customerName ?? "—"}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <StatusBadge
                  value={invoice.status}
                  variants={INVOICE_STATUS_VARIANTS}
                  labels={statusLabels}
                />
                {invoice.status === "issued" && (
                  <StatusBadge
                    value={invoice.settlement}
                    variants={INVOICE_SETTLEMENT_VARIANTS}
                    labels={settlementLabels}
                  />
                )}
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {money(invoice.vatCents)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {money(invoice.totalCents)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {invoice.dueCents > 0 ? money(invoice.dueCents) : "—"}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                {invoice.status === "issued" && invoice.dueCents > 0 && (
                  <Can permission={{ cash: ["take-payment"] }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSettle(invoice)}
                    >
                      {t("ui.web.invoices.settle")}
                    </Button>
                  </Can>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPrint(invoice)}
                >
                  {t("ui.action.print")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAudit(invoice)}
                >
                  {t("ui.web.invoices.auditLog")}
                </Button>
                {invoice.status === "issued" &&
                  invoice.creditableSubtotalCents > 0 && (
                    <Can permission={{ invoice: ["credit-note"] }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCredit(invoice)}
                      >
                        {t("ui.web.invoices.credit")}
                      </Button>
                    </Can>
                  )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

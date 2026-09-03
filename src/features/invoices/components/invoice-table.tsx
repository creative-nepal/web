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
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_VARIANTS } from "../constants";
import type { Invoice } from "../types";

interface InvoiceTableProps {
  invoices: Invoice[];
  onPrint: (invoice: Invoice) => void;
  onCredit: (invoice: Invoice) => void;
}

export function InvoiceTable({
  invoices,
  onPrint,
  onCredit,
}: InvoiceTableProps) {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No.</TableHead>
          <TableHead>{t("common.invoice.dateBs")}</TableHead>
          <TableHead>{t("ui.field.buyer")}</TableHead>
          <TableHead>{t("ui.field.status")}</TableHead>
          <TableHead className="text-right">
            {t("ui.web.pos.discount")}
          </TableHead>
          <TableHead className="text-right">
            {t("common.invoice.vat")}
          </TableHead>
          <TableHead className="text-right">{t("ui.field.total")}</TableHead>
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
              <StatusBadge
                value={invoice.status}
                variants={INVOICE_STATUS_VARIANTS}
                labels={INVOICE_STATUS_LABELS}
              />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {invoice.discountCents > 0
                ? `- ${money(invoice.discountCents)}`
                : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {money(invoice.vatCents)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {money(invoice.totalCents)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onPrint(invoice)}
                >
                  {t("ui.action.print")}
                </Button>
                {invoice.status === "issued" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCredit(invoice)}
                  >
                    {t("ui.web.invoices.credit")}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

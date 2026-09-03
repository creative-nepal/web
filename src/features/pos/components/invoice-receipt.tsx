"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import { printInvoice } from "../services";
import type { CheckoutInvoice } from "../types";

export function InvoiceReceipt({
  businessId,
  invoice,
  onDismiss,
}: {
  businessId: string;
  invoice: CheckoutInvoice;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  const [printedCount, setPrintedCount] = useState(invoice.printedCount);

  const print = useMutation({
    mutationFn: () => printInvoice(businessId, invoice.id),
    onSuccess: (result) => {
      setPrintedCount(result.printedCount);
      window.print();
    },
  });

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      title={`Invoice #${invoice.invoiceNumber}`}
      description={`Fiscal year ${invoice.fiscalYear} · ${invoice.issuedAtBs} BS`}
    >
      <div className="flex flex-col gap-3">
        {printedCount > 1 && (
          <Badge variant="destructive">{t("common.invoice.copy")}</Badge>
        )}

        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("ui.field.subtotal")}</dt>
            <dd className="tabular-nums">{money(invoice.subtotalCents)}</dd>
          </div>
          {invoice.discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("ui.web.pos.discount")}
              </dt>
              <dd className="tabular-nums">- {money(invoice.discountCents)}</dd>
            </div>
          )}
          {invoice.serviceChargeCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t("ui.web.pos.serviceCharge")}
              </dt>
              <dd className="tabular-nums">
                {money(invoice.serviceChargeCents)}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("common.invoice.vat")}</dt>
            <dd className="tabular-nums">{money(invoice.vatCents)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <dt>{t("ui.field.total")}</dt>
            <dd className="tabular-nums">{money(invoice.totalCents)}</dd>
          </div>
        </dl>

        <div className="flex gap-2">
          <Button onClick={() => print.mutate()} disabled={print.isPending}>
            {printedCount > 0 ? "Print copy" : "Print"}
          </Button>
          <Button variant="outline" onClick={onDismiss}>
            {t("ui.web.pos.newSale")}
          </Button>
        </div>
      </div>
    </ContentDialog>
  );
}

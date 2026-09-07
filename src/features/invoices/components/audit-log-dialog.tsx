"use client";

import { useQuery } from "@tanstack/react-query";
import { ContentDialog } from "@/components/composed/content-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { auditLogQueryOptions } from "../queries";
import type { Invoice } from "../types";

export function AuditLogDialog({
  businessId,
  invoice,
  onClose,
}: {
  businessId: string;
  invoice: Invoice;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { data } = useQuery(auditLogQueryOptions(businessId, invoice.id));
  const entries = data?.data ?? [];

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t("ui.web.invoices.auditTitle", {
        number: invoice.invoiceNumber,
      })}
    >
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("ui.web.invoices.auditEmpty")}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.when")}</TableHead>
              <TableHead>{t("ui.field.action")}</TableHead>
              <TableHead>{t("ui.field.reason")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm">
                  {new Date(entry.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {t(`ui.web.invoices.audit.${entry.action}`)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {detailOf(entry.metadata)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </ContentDialog>
  );
}

function detailOf(metadata: Record<string, unknown>): string {
  const reason = metadata.reason;

  if (typeof reason === "string" && reason.trim()) {
    return reason;
  }

  const methods = metadata.methods;

  if (Array.isArray(methods) && methods.length > 0) {
    return methods.join(", ");
  }

  return "—";
}

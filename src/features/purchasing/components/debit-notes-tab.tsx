"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/composed/empty-state";
import { Badge } from "@/components/ui/badge";
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
import { useSupplierNames } from "../hooks/use-supplier-names";
import { debitNotesQueryOptions } from "../queries";

export function DebitNotesTab({ businessId }: { businessId: string }) {
  const { t } = useTranslation();

  const supplierName = useSupplierNames(businessId);
  const { data: notes } = useQuery(debitNotesQueryOptions(businessId));

  const rows = notes?.data ?? [];

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t("ui.web.purchasing.debitNotesEmptyTitle")}
        description={t("ui.web.purchasing.debitNotesEmptyBody")}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("ui.web.purchasing.debitNote")}</TableHead>
          <TableHead>{t("ui.field.supplier")}</TableHead>
          <TableHead>{t("ui.field.reason")}</TableHead>
          <TableHead className="text-right">{t("ui.field.total")}</TableHead>
          <TableHead>{t("ui.field.stock")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((note) => (
          <TableRow key={note.id}>
            <TableCell className="font-medium">
              {note.series}-{note.noteNumber}
              <span className="block text-muted-foreground text-xs">
                {note.issuedAt.slice(0, 10)}
              </span>
            </TableCell>
            <TableCell>{supplierName(note.supplierId)}</TableCell>
            <TableCell>
              {t(`common.debitNoteReason.${note.reason}`)}
              {note.note && (
                <span className="block text-muted-foreground text-xs">
                  {note.note}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {money(note.totalCents)}
            </TableCell>
            <TableCell>
              {note.restocked && (
                <Badge variant="secondary">
                  {t("ui.web.purchasing.restock")}
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

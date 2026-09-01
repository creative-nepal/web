"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import { PageHeader } from "@/components/composed/page-header";
import { DataSection } from "@/components/data-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { InvoiceTable } from "../components/invoice-table";
import { PaginationControls } from "../components/pagination-controls";
import { INVOICES_PAGE_SIZE } from "../constants";
import { invoiceQueryKeys, invoicesQueryOptions } from "../queries";
import {
  downloadSalesRegister,
  issueCreditNote,
  printInvoice,
} from "../services";
import type { Invoice } from "../types";

export function InvoicesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [fiscalYear, setFiscalYear] = useState("");
  const [page, setPage] = useState(0);
  const [creditFor, setCreditFor] = useState<Invoice | null>(null);

  const { data, isFetching } = useQuery(
    invoicesQueryOptions(
      business?.id ?? "",
      fiscalYear,
      page,
      INVOICES_PAGE_SIZE,
    ),
  );

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });

  const print = useMutation({
    mutationFn: (invoice: Invoice) =>
      printInvoice(business?.id ?? "", invoice.id),
    onSuccess: (updated) => {
      void refresh();
      toast.success(
        updated.printedCount > 1
          ? `Reprint recorded — copy ${updated.printedCount}`
          : "Print recorded",
      );
    },
  });

  const creditNote = useMutation({
    mutationFn: (invoice: Invoice) =>
      issueCreditNote(business?.id ?? "", invoice.id, "Correction"),
    onSuccess: (note) => {
      void refresh();
      toast.success(`Credit note #${note.invoiceNumber} issued`);
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Could not issue credit note";
      toast.error(message);
    },
  });

  if (!business) {
    return null;
  }

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.invoices.title")}
        description={t("ui.web.invoices.description")}
        actions={
          <div className="flex gap-2">
            {(["xlsx", "csv"] as const).map((format) => (
              <Button
                key={format}
                variant="outline"
                disabled={!fiscalYear}
                onClick={() =>
                  downloadSalesRegister(business.id, fiscalYear, format)
                }
              >
                {format === "xlsx" ? "Register (Excel)" : "CSV"}
              </Button>
            ))}
          </div>
        }
      />

      <Input
        value={fiscalYear}
        onChange={(event) => {
          setFiscalYear(event.target.value);
          setPage(0);
        }}
        placeholder={t("ui.web.invoices.fiscalYearPlaceholder")}
        className="max-w-sm"
      />

      <DataSection
        isEmpty={rows.length === 0}
        isLoading={isFetching}
        emptyTitle="No invoices"
        emptyDescription="Invoices appear here as sales are completed."
      >
        <InvoiceTable
          invoices={rows}
          onPrint={(invoice) => print.mutate(invoice)}
          onCredit={setCreditFor}
        />
        <PaginationControls
          page={page}
          pageSize={INVOICES_PAGE_SIZE}
          total={total}
          noun="invoice"
          onPageChange={setPage}
        />
      </DataSection>

      <ConfirmDialog
        open={creditFor !== null}
        onOpenChange={(open) => {
          if (!open) setCreditFor(null);
        }}
        title={t("ui.web.invoices.creditNoteTitle")}
        description={`This is the only way to correct invoice #${creditFor?.invoiceNumber}. The original stays in the register; the credit note takes the next number in the same sequence.`}
        confirmLabel={t("ui.web.invoices.issueCreditNote")}
        variant="destructive"
        onConfirm={async () => {
          if (creditFor) {
            await creditNote.mutateAsync(creditFor);
          }
        }}
      />
    </div>
  );
}

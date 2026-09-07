"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { SelectFilter } from "@/components/composed/select-filter";
import { DataSection } from "@/components/data-section";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { AuditLogDialog } from "../components/audit-log-dialog";
import { CreditNoteDialog } from "../components/credit-note-dialog";
import { InvoiceTable } from "../components/invoice-table";
import { SettleDialog } from "../components/settle-dialog";
import { INVOICES_PAGE_SIZE } from "../constants";
import { invoiceQueryKeys, invoicesQueryOptions } from "../queries";
import { downloadSalesRegister, printInvoice } from "../services";
import {
  INVOICE_SETTLEMENTS,
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceFilters,
  type InvoiceSettlement,
  type InvoiceStatus,
} from "../types";

const FISCAL_YEAR_PATTERN = /^\d{4}-\d{2}$/;

const EMPTY_FILTERS: InvoiceFilters = {
  fiscalYear: "",
  status: null,
  settlement: null,
  search: "",
};

export function InvoicesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [fiscalYearDraft, setFiscalYearDraft] = useState("");
  const [filters, setFilters] = useState<InvoiceFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [creditFor, setCreditFor] = useState<Invoice | null>(null);
  const [settleFor, setSettleFor] = useState<Invoice | null>(null);
  const [auditFor, setAuditFor] = useState<Invoice | null>(null);

  const fiscalYearValid =
    fiscalYearDraft === "" || FISCAL_YEAR_PATTERN.test(fiscalYearDraft);

  const { data, isFetching } = useQuery(
    invoicesQueryOptions(business?.id ?? "", filters, page, INVOICES_PAGE_SIZE),
  );

  function update(patch: Partial<InvoiceFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  }

  const print = useMutation({
    mutationFn: (invoice: Invoice) =>
      printInvoice(business?.id ?? "", invoice.id),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      toast.success(
        updated.printedCount > 1
          ? t("ui.web.invoices.reprintRecorded", {
              count: updated.printedCount,
            })
          : t("ui.web.invoices.printRecorded"),
      );
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t("ui.web.invoices.printFailed"))),
  });

  if (!business) {
    return null;
  }

  const rows = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.invoices.title")}
        description={t("ui.web.invoices.description")}
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportMenu
              businessId={business.id}
              resource="invoices"
              label={t("ui.web.data.exportInvoices")}
            />
            <ExportMenu
              businessId={business.id}
              resource="orders"
              label={t("ui.web.data.exportSold")}
            />
            {(["xlsx", "csv"] as const).map((format) => (
              <Button
                key={format}
                variant="outline"
                disabled={!fiscalYearValid || fiscalYearDraft === ""}
                onClick={() =>
                  downloadSalesRegister(business.id, fiscalYearDraft, format)
                }
              >
                {format === "xlsx"
                  ? t("ui.web.invoices.registerExcel")
                  : t("ui.web.invoices.registerCsv")}
              </Button>
            ))}
          </div>
        }
      />

      <div className="flex flex-wrap items-start gap-2">
        <SearchInput
          className="max-w-xs"
          value={filters.search}
          onValueChange={(search) => update({ search })}
          placeholder={t("ui.web.invoices.search")}
        />

        <div className="flex flex-col gap-1">
          <Input
            value={fiscalYearDraft}
            aria-invalid={!fiscalYearValid}
            onChange={(event) => {
              const next = event.target.value;
              setFiscalYearDraft(next);

              if (next === "" || FISCAL_YEAR_PATTERN.test(next)) {
                update({ fiscalYear: next });
              }
            }}
            placeholder={t("ui.web.invoices.fiscalYearPlaceholder")}
            className="w-72"
          />
          {!fiscalYearValid && (
            <p className="text-destructive text-xs">
              {t("errors.invoice.fiscalYearFormat")}
            </p>
          )}
        </div>

        <SelectFilter
          className="w-40"
          value={filters.status}
          onValueChange={(status) =>
            update({ status: status as InvoiceStatus | null })
          }
          allLabel={t("ui.web.invoices.allStatuses")}
          options={INVOICE_STATUSES.map((status) => ({
            value: status,
            label: t(`ui.web.invoices.status.${status}`),
          }))}
        />

        <SelectFilter
          className="w-40"
          value={filters.settlement}
          onValueChange={(settlement) =>
            update({ settlement: settlement as InvoiceSettlement | null })
          }
          allLabel={t("ui.web.invoices.allSettlements")}
          options={INVOICE_SETTLEMENTS.map((settlement) => ({
            value: settlement,
            label: t(`ui.web.invoices.settlement.${settlement}`),
          }))}
        />

        <Button
          variant="ghost"
          onClick={() => {
            setFiscalYearDraft("");
            setFilters(EMPTY_FILTERS);
            setPage(0);
          }}
        >
          {t("ui.action.clear")}
        </Button>
      </div>

      <DataSection
        isEmpty={rows.length === 0}
        isLoading={isFetching}
        emptyTitle={t("ui.web.invoices.emptyTitle")}
        emptyDescription={t("ui.web.invoices.emptyBody")}
      >
        <InvoiceTable
          invoices={rows}
          onPrint={(invoice) => print.mutate(invoice)}
          onCredit={setCreditFor}
          onSettle={setSettleFor}
          onAudit={setAuditFor}
        />
        <PaginationControls
          page={page}
          pageSize={INVOICES_PAGE_SIZE}
          total={data?.total ?? 0}
          onPageChange={setPage}
        />
      </DataSection>

      {creditFor && (
        <CreditNoteDialog
          businessId={business.id}
          invoice={creditFor}
          onClose={() => setCreditFor(null)}
        />
      )}

      {settleFor && (
        <SettleDialog
          businessId={business.id}
          invoice={settleFor}
          onClose={() => setSettleFor(null)}
        />
      )}

      {auditFor && (
        <AuditLogDialog
          businessId={business.id}
          invoice={auditFor}
          onClose={() => setAuditFor(null)}
        />
      )}
    </div>
  );
}

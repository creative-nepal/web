import { api } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import type { PaginatedResult } from "@/types/api";
import type { AuditEntry, Invoice, InvoiceFilters } from "./types";

export async function listInvoices(
  businessId: string,
  params: Partial<InvoiceFilters> & { limit: number; offset: number },
): Promise<PaginatedResult<Invoice>> {
  const { data } = await api.get<PaginatedResult<Invoice>>(
    `/api/v1/businesses/${businessId}/invoices`,
    {
      params: {
        limit: params.limit,
        offset: params.offset,
        ...(params.fiscalYear ? { fiscalYear: params.fiscalYear } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.settlement ? { settlement: params.settlement } : {}),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function getInvoice(
  businessId: string,
  invoiceId: string,
): Promise<Invoice> {
  const { data } = await api.get<Invoice>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}`,
  );
  return data;
}

export async function getAuditLog(
  businessId: string,
  invoiceId: string,
): Promise<PaginatedResult<AuditEntry>> {
  const { data } = await api.get<PaginatedResult<AuditEntry>>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/audit-log`,
  );
  return data;
}

export async function issueCreditNote(
  businessId: string,
  invoiceId: string,
  input: { subtotalCents?: number; reason: string },
): Promise<Invoice> {
  const { data } = await api.post<Invoice>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/credit-note`,
    input,
  );
  return data;
}

export async function printInvoice(
  businessId: string,
  invoiceId: string,
): Promise<Invoice> {
  const { data } = await api.post<Invoice>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/print`,
    {},
  );
  return data;
}

export function downloadSalesRegister(
  businessId: string,
  fiscalYear: string,
  format: "xlsx" | "csv",
): Promise<void> {
  return downloadFile(
    `/api/v1/businesses/${businessId}/invoices/registers`,
    { fiscalYear, format },
    `sales-register.${format}`,
  );
}

import { api } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import type { PaginatedResult } from "@/types/api";
import type { AuditEntry, Invoice } from "./types";

export async function listInvoices(
  businessId: string,
  params: {
    fiscalYear?: string;
    status?: string;
    limit: number;
    offset: number;
  },
): Promise<PaginatedResult<Invoice>> {
  const { data } = await api.get<PaginatedResult<Invoice>>(
    `/api/v1/businesses/${businessId}/invoices`,
    { params },
  );
  return data;
}

export async function getAuditLog(
  businessId: string,
  invoiceId: string,
): Promise<AuditEntry[]> {
  const { data } = await api.get<AuditEntry[]>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/audit-log`,
  );
  return data;
}

export async function issueCreditNote(
  businessId: string,
  invoiceId: string,
  reason: string,
): Promise<Invoice> {
  const { data } = await api.post<Invoice>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/credit-note`,
    { reason },
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

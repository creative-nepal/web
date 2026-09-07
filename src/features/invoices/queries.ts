import { queryOptions } from "@tanstack/react-query";
import { listInvoicePayments } from "@/features/cash/services";
import { getAuditLog, getInvoice, listInvoices } from "./services";
import type { InvoiceFilters } from "./types";

export const invoiceQueryKeys = {
  all: ["invoices"] as const,
  list: (businessId: string, filters: InvoiceFilters, page: number) =>
    [...invoiceQueryKeys.all, "list", businessId, filters, page] as const,
  detail: (businessId: string, invoiceId: string) =>
    [...invoiceQueryKeys.all, "detail", businessId, invoiceId] as const,
  audit: (businessId: string, invoiceId: string) =>
    [...invoiceQueryKeys.all, "audit", businessId, invoiceId] as const,
  payments: (businessId: string, invoiceId: string) =>
    [...invoiceQueryKeys.all, "payments", businessId, invoiceId] as const,
};

export function invoicesQueryOptions(
  businessId: string,
  filters: InvoiceFilters,
  page: number,
  pageSize: number,
) {
  return queryOptions({
    queryKey: invoiceQueryKeys.list(businessId, filters, page),
    queryFn: () =>
      listInvoices(businessId, {
        ...filters,
        limit: pageSize,
        offset: page * pageSize,
      }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

export function invoiceQueryOptions(
  businessId: string,
  invoiceId: string | null,
) {
  return queryOptions({
    queryKey: invoiceQueryKeys.detail(businessId, invoiceId ?? ""),
    queryFn: () => getInvoice(businessId, invoiceId ?? ""),
    enabled: Boolean(businessId && invoiceId),
  });
}

export function auditLogQueryOptions(
  businessId: string,
  invoiceId: string | null,
) {
  return queryOptions({
    queryKey: invoiceQueryKeys.audit(businessId, invoiceId ?? ""),
    queryFn: () => getAuditLog(businessId, invoiceId ?? ""),
    enabled: Boolean(businessId && invoiceId),
  });
}

export function invoicePaymentsQueryOptions(
  businessId: string,
  invoiceId: string | null,
) {
  return queryOptions({
    queryKey: invoiceQueryKeys.payments(businessId, invoiceId ?? ""),
    queryFn: () => listInvoicePayments(businessId, invoiceId ?? ""),
    enabled: Boolean(businessId && invoiceId),
  });
}

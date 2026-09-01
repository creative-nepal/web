import { queryOptions } from "@tanstack/react-query";
import { getAuditLog, listInvoices } from "./services";

export const invoiceQueryKeys = {
  all: ["invoices"] as const,
  list: (businessId: string, fiscalYear: string, page: number) =>
    [...invoiceQueryKeys.all, businessId, fiscalYear, page] as const,
  audit: (businessId: string, invoiceId: string) =>
    [...invoiceQueryKeys.all, "audit", businessId, invoiceId] as const,
};

export function invoicesQueryOptions(
  businessId: string,
  fiscalYear: string,
  page: number,
  pageSize: number,
) {
  return queryOptions({
    queryKey: invoiceQueryKeys.list(businessId, fiscalYear, page),
    queryFn: () =>
      listInvoices(businessId, {
        fiscalYear: fiscalYear || undefined,
        limit: pageSize,
        offset: page * pageSize,
      }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

export function auditLogQueryOptions(businessId: string, invoiceId: string) {
  return queryOptions({
    queryKey: invoiceQueryKeys.audit(businessId, invoiceId),
    queryFn: () => getAuditLog(businessId, invoiceId),
    enabled: Boolean(invoiceId),
  });
}

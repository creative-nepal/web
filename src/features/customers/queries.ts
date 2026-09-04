import { queryOptions } from "@tanstack/react-query";
import { getLedger, getReferral, listCustomers } from "./services";

export const customerQueryKeys = {
  all: ["customers"] as const,
  list: (businessId: string, search: string, owing: boolean) =>
    [...customerQueryKeys.all, businessId, search, owing] as const,
  ledger: (businessId: string, customerId: string) =>
    [...customerQueryKeys.all, "ledger", businessId, customerId] as const,
  referral: (businessId: string, customerId: string) =>
    [...customerQueryKeys.all, "referral", businessId, customerId] as const,
};

export function customersQueryOptions(
  businessId: string,
  search: string,
  owing: boolean,
) {
  return queryOptions({
    queryKey: customerQueryKeys.list(businessId, search, owing),
    queryFn: () =>
      listCustomers(businessId, {
        search: search || undefined,
        owing: owing ? "true" : undefined,
      }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

export function ledgerQueryOptions(businessId: string, customerId: string) {
  return queryOptions({
    queryKey: customerQueryKeys.ledger(businessId, customerId),
    queryFn: () => getLedger(businessId, customerId),
    enabled: Boolean(businessId && customerId),
  });
}

export function referralQueryOptions(businessId: string, customerId: string) {
  return queryOptions({
    queryKey: customerQueryKeys.referral(businessId, customerId),
    queryFn: () => getReferral(businessId, customerId),
    enabled: Boolean(businessId && customerId),
  });
}

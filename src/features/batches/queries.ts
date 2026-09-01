import { queryOptions } from "@tanstack/react-query";
import { listExpiring, listForProduct } from "./services";

export const batchQueryKeys = {
  all: ["batches"] as const,
  expiring: (businessId: string, withinDays: number) =>
    [...batchQueryKeys.all, "expiring", businessId, withinDays] as const,
  forProduct: (businessId: string, productId: string) =>
    [...batchQueryKeys.all, businessId, productId] as const,
};

export function expiringBatchesQueryOptions(
  businessId: string,
  withinDays: number,
) {
  return queryOptions({
    queryKey: batchQueryKeys.expiring(businessId, withinDays),
    queryFn: () => listExpiring(businessId, withinDays),
    enabled: Boolean(businessId),
  });
}

export function productBatchesQueryOptions(
  businessId: string,
  productId: string,
) {
  return queryOptions({
    queryKey: batchQueryKeys.forProduct(businessId, productId),
    queryFn: () => listForProduct(businessId, productId),
    enabled: Boolean(businessId && productId),
  });
}

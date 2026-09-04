import { queryOptions } from "@tanstack/react-query";
import { LIVE_SALES_POLL_INTERVAL_MS } from "./constants";
import {
  getAging,
  getLiveSales,
  getProfit,
  getStockMovement,
} from "./services";

export const reportsQueryKeys = {
  all: ["reports"] as const,
  liveSales: (businessId: string, businessDate: string) =>
    [...reportsQueryKeys.all, "live-sales", businessId, businessDate] as const,
  profit: (businessId: string, from: string, to: string) =>
    [...reportsQueryKeys.all, "profit", businessId, from, to] as const,
  aging: (businessId: string, kind: string, asOf: string) =>
    [...reportsQueryKeys.all, "aging", businessId, kind, asOf] as const,
  stockMovement: (
    businessId: string,
    productId: string,
    from: string,
    to: string,
  ) =>
    [
      ...reportsQueryKeys.all,
      "stock-movement",
      businessId,
      productId,
      from,
      to,
    ] as const,
};

export function liveSalesQueryOptions(
  businessId: string,
  businessDate: string,
) {
  return queryOptions({
    queryKey: reportsQueryKeys.liveSales(businessId, businessDate),
    queryFn: () => getLiveSales(businessId, businessDate || undefined),
    enabled: Boolean(businessId),
    refetchInterval: businessDate ? false : LIVE_SALES_POLL_INTERVAL_MS,
  });
}

export function profitQueryOptions(
  businessId: string,
  from: string,
  to: string,
) {
  return queryOptions({
    queryKey: reportsQueryKeys.profit(businessId, from, to),
    queryFn: () => getProfit(businessId, from, to),
    enabled: Boolean(businessId),
  });
}

export function agingQueryOptions(
  businessId: string,
  kind: "receivables" | "payables",
  asOf: string,
) {
  return queryOptions({
    queryKey: reportsQueryKeys.aging(businessId, kind, asOf),
    queryFn: () => getAging(businessId, kind, asOf),
    enabled: Boolean(businessId),
  });
}

export function stockMovementQueryOptions(
  businessId: string,
  productId: string,
  from: string,
  to: string,
) {
  return queryOptions({
    queryKey: reportsQueryKeys.stockMovement(businessId, productId, from, to),
    queryFn: () => getStockMovement(businessId, productId, from, to),
    enabled: Boolean(businessId && productId),
  });
}

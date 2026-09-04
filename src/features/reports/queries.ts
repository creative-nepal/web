import { queryOptions } from "@tanstack/react-query";
import { LIVE_SALES_POLL_INTERVAL_MS } from "./constants";
import { getLiveSales } from "./services";

export const reportsQueryKeys = {
  all: ["reports"] as const,
  liveSales: (businessId: string, businessDate: string) =>
    [...reportsQueryKeys.all, "live-sales", businessId, businessDate] as const,
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

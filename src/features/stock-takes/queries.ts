import { queryOptions } from "@tanstack/react-query";
import {
  getStockTake,
  type ListStockTakesParams,
  listStockTakes,
} from "./services";

export const stockTakeQueryKeys = {
  all: ["stock-takes"] as const,
  list: (businessId: string, params: ListStockTakesParams) =>
    [...stockTakeQueryKeys.all, "list", businessId, params] as const,
  detail: (businessId: string, stockTakeId: string) =>
    [...stockTakeQueryKeys.all, "detail", businessId, stockTakeId] as const,
};

export function stockTakesQueryOptions(
  businessId: string,
  params: ListStockTakesParams,
) {
  return queryOptions({
    queryKey: stockTakeQueryKeys.list(businessId, params),
    queryFn: () => listStockTakes(businessId, params),
    enabled: Boolean(businessId),
  });
}

export function stockTakeQueryOptions(
  businessId: string,
  stockTakeId: string | null,
) {
  return queryOptions({
    queryKey: stockTakeQueryKeys.detail(businessId, stockTakeId ?? ""),
    queryFn: () => getStockTake(businessId, stockTakeId ?? ""),
    enabled: Boolean(businessId && stockTakeId),
  });
}

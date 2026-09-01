import { queryOptions } from "@tanstack/react-query";
import { type ListProductsParams, listProducts } from "./services";

export const productQueryKeys = {
  all: ["products"] as const,
  list: (businessId: string, search: string) =>
    [...productQueryKeys.all, businessId, search] as const,
};

export function productsQueryOptions(
  businessId: string,
  search: string,
  params: Omit<ListProductsParams, "search"> = {},
) {
  return queryOptions({
    queryKey: productQueryKeys.list(businessId, search),
    queryFn: () => listProducts(businessId, { search, ...params }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

import { queryOptions } from "@tanstack/react-query";
import { listClaims } from "./services";

export const claimQueryKeys = {
  all: ["claims"] as const,
  list: (businessId: string) => [...claimQueryKeys.all, businessId] as const,
};

export function claimsQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: claimQueryKeys.list(businessId),
    queryFn: () => listClaims(businessId),
    enabled: Boolean(businessId),
  });
}

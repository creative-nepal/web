import { queryOptions } from "@tanstack/react-query";
import { getEntitlements, listMyBusinesses } from "./services";

export const businessQueryKeys = {
  all: ["businesses"] as const,
  mine: () => [...businessQueryKeys.all, "mine"] as const,
  entitlements: (businessId: string) =>
    [...businessQueryKeys.all, "entitlements", businessId] as const,
};

export function myBusinessesQueryOptions() {
  return queryOptions({
    queryKey: businessQueryKeys.mine(),
    queryFn: listMyBusinesses,
  });
}

export function entitlementsQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: businessQueryKeys.entitlements(businessId),
    queryFn: () => getEntitlements(businessId),
    enabled: Boolean(businessId),
  });
}

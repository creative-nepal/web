import { queryOptions } from "@tanstack/react-query";
import { listRoles } from "./services";

export const roleQueryKeys = {
  all: ["roles"] as const,
  list: (businessId: string) => [...roleQueryKeys.all, businessId] as const,
};

export function rolesQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: roleQueryKeys.list(businessId),
    queryFn: () => listRoles(businessId),
    enabled: Boolean(businessId),
  });
}

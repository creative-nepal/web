import { queryOptions } from "@tanstack/react-query";
import { listBranches } from "./services";

export const branchQueryKeys = {
  all: ["branches"] as const,
  list: (businessId: string) => [...branchQueryKeys.all, businessId] as const,
};

export function branchesQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: branchQueryKeys.list(businessId),
    queryFn: () => listBranches(businessId),
    enabled: Boolean(businessId),
  });
}

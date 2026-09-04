import { queryOptions } from "@tanstack/react-query";
import { getWastageReport, listWastage } from "./services";

export const wastageQueryKeys = {
  all: ["wastage"] as const,
  list: (businessId: string) =>
    [...wastageQueryKeys.all, "list", businessId] as const,
  report: (businessId: string) =>
    [...wastageQueryKeys.all, "report", businessId] as const,
};

export function wastageQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: wastageQueryKeys.list(businessId),
    queryFn: () => listWastage(businessId),
    enabled: Boolean(businessId),
  });
}

export function wastageReportQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: wastageQueryKeys.report(businessId),
    queryFn: () => getWastageReport(businessId),
    enabled: Boolean(businessId),
  });
}

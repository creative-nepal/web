import { queryOptions } from "@tanstack/react-query";
import { getChannelPerformance, listChannels } from "./services";

export const channelQueryKeys = {
  all: ["channels"] as const,
  list: (businessId: string) =>
    [...channelQueryKeys.all, "list", businessId] as const,
  performance: (businessId: string) =>
    [...channelQueryKeys.all, "performance", businessId] as const,
};

export function channelsQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: channelQueryKeys.list(businessId),
    queryFn: () => listChannels(businessId),
    enabled: Boolean(businessId),
  });
}

export function channelPerformanceQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: channelQueryKeys.performance(businessId),
    queryFn: () => getChannelPerformance(businessId),
    enabled: Boolean(businessId),
  });
}

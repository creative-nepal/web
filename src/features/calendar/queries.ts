import { queryOptions } from "@tanstack/react-query";
import { fetchFeed } from "./services";

export const calendarQueryKeys = {
  all: ["calendar"] as const,
  feed: (businessId: string, from: string, to: string) =>
    [...calendarQueryKeys.all, "feed", businessId, from, to] as const,
};

export function calendarFeedQueryOptions(
  businessId: string,
  from: string,
  to: string,
) {
  return queryOptions({
    queryKey: calendarQueryKeys.feed(businessId, from, to),
    queryFn: () => fetchFeed(businessId, from, to),
    enabled: Boolean(businessId),
  });
}

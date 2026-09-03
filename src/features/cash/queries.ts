import { queryOptions } from "@tanstack/react-query";
import { getCurrentSession, listSessions } from "./services";

export const cashQueryKeys = {
  all: ["cash"] as const,
  current: (businessId: string) =>
    [...cashQueryKeys.all, "current", businessId] as const,
  sessions: (businessId: string) =>
    [...cashQueryKeys.all, "sessions", businessId] as const,
};

export function currentSessionQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: cashQueryKeys.current(businessId),
    queryFn: () => getCurrentSession(businessId),
    enabled: Boolean(businessId),
  });
}

export function cashSessionsQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: cashQueryKeys.sessions(businessId),
    queryFn: () => listSessions(businessId, { status: "closed", limit: 20 }),
    enabled: Boolean(businessId),
  });
}

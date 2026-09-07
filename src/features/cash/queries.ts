import { queryOptions } from "@tanstack/react-query";
import {
  getCurrentSession,
  getSession,
  listSessionPayments,
  listSessions,
} from "./services";

export const CASH_SESSIONS_PAGE_SIZE = 20;

export const cashQueryKeys = {
  all: ["cash"] as const,
  current: (businessId: string) =>
    [...cashQueryKeys.all, "current", businessId] as const,
  sessions: (businessId: string, status: string, page: number) =>
    [...cashQueryKeys.all, "sessions", businessId, status, page] as const,
  session: (businessId: string, sessionId: string) =>
    [...cashQueryKeys.all, "session", businessId, sessionId] as const,
  sessionPayments: (businessId: string, sessionId: string) =>
    [...cashQueryKeys.all, "session-payments", businessId, sessionId] as const,
};

export function currentSessionQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: cashQueryKeys.current(businessId),
    queryFn: () => getCurrentSession(businessId),
    enabled: Boolean(businessId),
  });
}

export function cashSessionsQueryOptions(
  businessId: string,
  status: string,
  page: number,
) {
  return queryOptions({
    queryKey: cashQueryKeys.sessions(businessId, status, page),
    queryFn: () =>
      listSessions(businessId, {
        ...(status ? { status } : {}),
        limit: CASH_SESSIONS_PAGE_SIZE,
        offset: page * CASH_SESSIONS_PAGE_SIZE,
      }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

export function cashSessionQueryOptions(
  businessId: string,
  sessionId: string | null,
) {
  return queryOptions({
    queryKey: cashQueryKeys.session(businessId, sessionId ?? ""),
    queryFn: () => getSession(businessId, sessionId ?? ""),
    enabled: Boolean(businessId && sessionId),
  });
}

export function cashSessionPaymentsQueryOptions(
  businessId: string,
  sessionId: string | null,
) {
  return queryOptions({
    queryKey: cashQueryKeys.sessionPayments(businessId, sessionId ?? ""),
    queryFn: () => listSessionPayments(businessId, sessionId ?? ""),
    enabled: Boolean(businessId && sessionId),
  });
}

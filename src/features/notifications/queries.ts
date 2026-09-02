import { queryOptions } from "@tanstack/react-query";
import { getUnreadCount, listNotifications } from "./services";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (businessId: string) =>
    [...notificationQueryKeys.all, businessId] as const,
  unread: (businessId: string) =>
    [...notificationQueryKeys.all, "unread", businessId] as const,
};

export function notificationsQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: notificationQueryKeys.list(businessId),
    queryFn: () => listNotifications(businessId),
    enabled: Boolean(businessId),
  });
}

export function unreadCountQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: notificationQueryKeys.unread(businessId),
    queryFn: () => getUnreadCount(businessId),
    enabled: Boolean(businessId),
    refetchInterval: 60_000,
  });
}

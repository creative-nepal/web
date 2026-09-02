import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Notification } from "./types";

export async function listNotifications(
  businessId: string,
): Promise<PaginatedResult<Notification>> {
  const { data } = await api.get<PaginatedResult<Notification>>(
    `/api/v1/businesses/${businessId}/notifications`,
    { params: { limit: 30 } },
  );
  return data;
}

export async function getUnreadCount(
  businessId: string,
): Promise<{ unread: number }> {
  const { data } = await api.get<{ unread: number }>(
    `/api/v1/businesses/${businessId}/notifications/unread-count`,
  );
  return data;
}

export async function markAllRead(
  businessId: string,
): Promise<{ marked: number }> {
  const { data } = await api.post<{ marked: number }>(
    `/api/v1/businesses/${businessId}/notifications/read-all`,
    {},
  );
  return data;
}

export async function markRead(
  businessId: string,
  notificationId: string,
): Promise<void> {
  await api.post(
    `/api/v1/businesses/${businessId}/notifications/${notificationId}/read`,
    {},
  );
}

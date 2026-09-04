import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { CalendarEntry, CalendarEvent, Recurrence } from "./types";

export async function fetchFeed(
  businessId: string,
  from: string,
  to: string,
  scope?: string,
): Promise<CalendarEntry[]> {
  const { data } = await api.get<CalendarEntry[]>(
    `/api/v1/businesses/${businessId}/calendar`,
    { params: { from, to, ...(scope ? { scope } : {}) } },
  );
  return data;
}

export async function listEvents(
  businessId: string,
): Promise<PaginatedResult<CalendarEvent>> {
  const { data } = await api.get<PaginatedResult<CalendarEvent>>(
    `/api/v1/businesses/${businessId}/calendar/events`,
    { params: { limit: 100 } },
  );
  return data;
}

export interface CreateEventInput {
  scope: string;
  kind?: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  allDay?: boolean;
  branchId?: string;
  assignedToUserId?: string;
  recurrence?: Recurrence;
  remindMinutesBefore?: number;
}

export async function createEvent(
  businessId: string,
  input: CreateEventInput,
): Promise<CalendarEvent> {
  const { data } = await api.post<CalendarEvent>(
    `/api/v1/businesses/${businessId}/calendar/events`,
    input,
  );
  return data;
}

export async function updateEvent(
  businessId: string,
  eventId: string,
  input: Partial<CreateEventInput> & { status?: string },
): Promise<CalendarEvent> {
  const { data } = await api.patch<CalendarEvent>(
    `/api/v1/businesses/${businessId}/calendar/events/${eventId}`,
    input,
  );
  return data;
}

export async function deleteEvent(
  businessId: string,
  eventId: string,
): Promise<void> {
  await api.delete(
    `/api/v1/businesses/${businessId}/calendar/events/${eventId}`,
  );
}

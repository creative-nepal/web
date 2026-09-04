export const CALENDAR_SCOPES = ["organisation", "branch", "personal"] as const;
export type CalendarScope = (typeof CALENDAR_SCOPES)[number];

export const CALENDAR_KINDS = [
  "event",
  "reminder",
  "task",
  "deadline",
  "holiday",
] as const;
export type CalendarKind = (typeof CALENDAR_KINDS)[number];

export const RECURRENCE_FREQUENCIES = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export interface Recurrence {
  freq: RecurrenceFrequency;
  interval: number;
  byWeekday?: number[];
  until?: string;
  count?: number;
}

export interface CalendarEntry {
  id: string;
  source: "event" | "appointment" | "reservation";
  scope: CalendarScope;
  kind: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  branchId: string | null;
  status: string;
  assignedToUserId: string | null;
  linkedType: string | null;
  linkedId: string | null;
}

export interface CalendarEvent {
  id: string;
  scope: CalendarScope;
  kind: CalendarKind;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  branchId: string | null;
  recurrence: Recurrence | null;
  remindMinutesBefore: number | null;
  assignedToUserId: string | null;
  status: string;
}

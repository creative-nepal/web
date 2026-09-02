export const APPOINTMENT_STATUSES = [
  "booked",
  "completed",
  "no_show",
  "canceled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface Appointment {
  id: string;
  serviceItemId: string;
  customerId: string | null;
  membershipId: string | null;
  staffUserId: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateAppointmentInput {
  serviceItemId: string;
  customerId?: string;
  membershipId?: string;
  staffUserId?: string;
  scheduledAt: string;
  durationMinutes?: number;
  note?: string;
}

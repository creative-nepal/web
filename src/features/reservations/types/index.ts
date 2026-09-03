export type ReservationStatus =
  | "booked"
  | "seated"
  | "completed"
  | "no_show"
  | "cancelled";

export interface Reservation {
  id: string;
  businessId: string;
  branchId: string;
  tableId: string | null;
  customerId: string | null;
  guestName: string;
  guestPhone: string | null;
  partySize: number;
  reservedFor: string;
  durationMinutes: number;
  status: ReservationStatus;
  note: string | null;
  seatedAt: string | null;
  closedAt: string | null;
  createdAt: string;
}

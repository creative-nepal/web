import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Reservation } from "./types";

export interface ListReservationsParams {
  status?: string;
  from?: string;
  to?: string;
  tableId?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function listReservations(
  businessId: string,
  params: ListReservationsParams = {},
): Promise<PaginatedResult<Reservation>> {
  const { data } = await api.get<PaginatedResult<Reservation>>(
    `/api/v1/businesses/${businessId}/reservations`,
    { params },
  );
  return data;
}

export interface CreateReservationInput {
  guestName: string;
  guestPhone?: string;
  tableId?: string;
  partySize: number;
  reservedFor: string;
  durationMinutes?: number;
  note?: string;
}

export async function createReservation(
  businessId: string,
  input: CreateReservationInput,
): Promise<Reservation> {
  const { data } = await api.post<Reservation>(
    `/api/v1/businesses/${businessId}/reservations`,
    input,
  );
  return data;
}

export async function reservationAction(
  businessId: string,
  reservationId: string,
  action: "seat" | "complete" | "no-show" | "cancel",
  body: Record<string, unknown> = {},
): Promise<Reservation> {
  const { data } = await api.post<Reservation>(
    `/api/v1/businesses/${businessId}/reservations/${reservationId}/${action}`,
    body,
  );
  return data;
}

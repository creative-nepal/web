import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
} from "./types";

export interface ListAppointmentsParams {
  status?: string;
  staffUserId?: string;
  customerId?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function listAppointments(
  businessId: string,
  params: ListAppointmentsParams = {},
): Promise<PaginatedResult<Appointment>> {
  const { data } = await api.get<PaginatedResult<Appointment>>(
    `/api/v1/businesses/${businessId}/appointments`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function bookAppointment(
  businessId: string,
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const { data } = await api.post<Appointment>(
    `/api/v1/businesses/${businessId}/appointments`,
    input,
  );
  return data;
}

export async function setAppointmentStatus(
  businessId: string,
  appointmentId: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(
    `/api/v1/businesses/${businessId}/appointments/${appointmentId}/status`,
    { status },
  );
  return data;
}

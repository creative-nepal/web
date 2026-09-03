import { api } from "@/lib/api";
import type { AvailabilityWindow } from "./types";

export async function getAvailability(
  businessId: string,
  staffUserId: string,
): Promise<AvailabilityWindow[]> {
  const { data } = await api.get<AvailabilityWindow[]>(
    `/api/v1/businesses/${businessId}/appointments/availability/${staffUserId}`,
  );
  return data;
}

export async function setAvailability(
  businessId: string,
  staffUserId: string,
  windows: Array<{
    dayOfWeek: number;
    startMinute: number;
    endMinute: number;
  }>,
): Promise<AvailabilityWindow[]> {
  const { data } = await api.put<AvailabilityWindow[]>(
    `/api/v1/businesses/${businessId}/appointments/availability/${staffUserId}`,
    { windows },
  );
  return data;
}

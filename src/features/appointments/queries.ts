import { queryOptions } from "@tanstack/react-query";
import { type ListAppointmentsParams, listAppointments } from "./services";

export const appointmentQueryKeys = {
  all: ["appointments"] as const,
  list: (businessId: string, status: string) =>
    [...appointmentQueryKeys.all, businessId, status] as const,
};

export function appointmentsQueryOptions(
  businessId: string,
  status: string,
  params: Omit<ListAppointmentsParams, "status"> = {},
) {
  return queryOptions({
    queryKey: appointmentQueryKeys.list(businessId, status),
    queryFn: () =>
      listAppointments(businessId, { status: status || undefined, ...params }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

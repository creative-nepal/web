import { queryOptions } from "@tanstack/react-query";
import { type ListReservationsParams, listReservations } from "./services";

export const reservationQueryKeys = {
  all: ["reservations"] as const,
  list: (businessId: string, params: ListReservationsParams) =>
    [...reservationQueryKeys.all, "list", businessId, params] as const,
};

export function reservationsQueryOptions(
  businessId: string,
  params: ListReservationsParams,
) {
  return queryOptions({
    queryKey: reservationQueryKeys.list(businessId, params),
    queryFn: () => listReservations(businessId, params),
    enabled: Boolean(businessId),
  });
}

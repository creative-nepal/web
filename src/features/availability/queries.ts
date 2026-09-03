import { queryOptions } from "@tanstack/react-query";
import { getAvailability } from "./services";

export const availabilityQueryKeys = {
  all: ["availability"] as const,
  forStaff: (businessId: string, staffUserId: string) =>
    [...availabilityQueryKeys.all, businessId, staffUserId] as const,
};

export function availabilityQueryOptions(
  businessId: string,
  staffUserId: string,
) {
  return queryOptions({
    queryKey: availabilityQueryKeys.forStaff(businessId, staffUserId),
    queryFn: () => getAvailability(businessId, staffUserId),
    enabled: Boolean(businessId && staffUserId),
  });
}

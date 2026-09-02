import { queryOptions } from "@tanstack/react-query";
import {
  type ListMembershipsParams,
  type ListServiceItemsParams,
  listMemberships,
  listServiceItems,
} from "./services";

export const serviceQueryKeys = {
  all: ["services"] as const,
  items: (businessId: string, search: string) =>
    [...serviceQueryKeys.all, "items", businessId, search] as const,
  memberships: (businessId: string, status: string) =>
    [...serviceQueryKeys.all, "memberships", businessId, status] as const,
};

export function serviceItemsQueryOptions(
  businessId: string,
  search: string,
  params: Omit<ListServiceItemsParams, "search"> = {},
) {
  return queryOptions({
    queryKey: serviceQueryKeys.items(businessId, search),
    queryFn: () => listServiceItems(businessId, { search, ...params }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

export function membershipsQueryOptions(
  businessId: string,
  status: string,
  params: Omit<ListMembershipsParams, "status"> = {},
) {
  return queryOptions({
    queryKey: serviceQueryKeys.memberships(businessId, status),
    queryFn: () =>
      listMemberships(businessId, { status: status || undefined, ...params }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

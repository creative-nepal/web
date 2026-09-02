import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type {
  CreateMembershipInput,
  CreateServiceItemInput,
  ServiceItem,
  ServiceMembership,
} from "./types";

export interface ListServiceItemsParams {
  search?: string;
  category?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function listServiceItems(
  businessId: string,
  params: ListServiceItemsParams = {},
): Promise<PaginatedResult<ServiceItem>> {
  const { data } = await api.get<PaginatedResult<ServiceItem>>(
    `/api/v1/businesses/${businessId}/services`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function createServiceItem(
  businessId: string,
  input: CreateServiceItemInput,
): Promise<ServiceItem> {
  const { data } = await api.post<ServiceItem>(
    `/api/v1/businesses/${businessId}/services`,
    input,
  );
  return data;
}

export interface ListMembershipsParams {
  customerId?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function listMemberships(
  businessId: string,
  params: ListMembershipsParams = {},
): Promise<PaginatedResult<ServiceMembership>> {
  const { data } = await api.get<PaginatedResult<ServiceMembership>>(
    `/api/v1/businesses/${businessId}/services/memberships`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function createMembership(
  businessId: string,
  input: CreateMembershipInput,
): Promise<ServiceMembership> {
  const { data } = await api.post<ServiceMembership>(
    `/api/v1/businesses/${businessId}/services/memberships`,
    input,
  );
  return data;
}

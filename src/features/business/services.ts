import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Business, Entitlements, Workspace } from "./types";

export async function listMyBusinesses(): Promise<Business[]> {
  const { data } = await api.get<PaginatedResult<Business>>(
    "/api/v1/businesses/me",
    { params: { limit: 50, offset: 0 } },
  );
  return data.data;
}

export async function getEntitlements(
  businessId: string,
): Promise<Entitlements> {
  const { data } = await api.get<Entitlements>(
    `/api/v1/businesses/${businessId}/entitlements`,
  );
  return data;
}

export async function getWorkspace(businessId: string): Promise<Workspace> {
  const { data } = await api.get<Workspace>(
    `/api/v1/businesses/${businessId}/workspace`,
  );
  return data;
}

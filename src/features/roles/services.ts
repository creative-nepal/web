import { api } from "@/lib/api";
import type { RoleCatalogue, RoleInput, RoleView } from "./types";

export async function listRoles(businessId: string): Promise<RoleCatalogue> {
  const { data } = await api.get<RoleCatalogue>(
    `/api/v1/businesses/${businessId}/roles`,
  );
  return data;
}

export async function createRole(
  businessId: string,
  input: RoleInput,
): Promise<RoleView> {
  const { data } = await api.post<RoleView>(
    `/api/v1/businesses/${businessId}/roles`,
    input,
  );
  return data;
}

export async function updateRole(
  businessId: string,
  role: string,
  permission: Record<string, string[]>,
): Promise<RoleView> {
  const { data } = await api.patch<RoleView>(
    `/api/v1/businesses/${businessId}/roles/${role}`,
    { permission },
  );
  return data;
}

export async function deleteRole(
  businessId: string,
  role: string,
): Promise<{ role: string }> {
  const { data } = await api.delete<{ role: string }>(
    `/api/v1/businesses/${businessId}/roles/${role}`,
  );
  return data;
}

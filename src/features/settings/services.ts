import type { Business } from "@/features/business/types";
import { api } from "@/lib/api";
import type { BranchRoleView, BusinessSettings } from "./types";
export async function updateBranding(
  businessId: string,
  input: { displayName?: string; theme: Record<string, string> },
): Promise<Business> {
  const { data } = await api.patch<Business>(
    `/api/v1/businesses/${businessId}`,
    input,
  );
  return data;
}

export async function getSettings(
  businessId: string,
): Promise<BusinessSettings> {
  const { data } = await api.get<BusinessSettings>(
    `/api/v1/businesses/${businessId}/settings`,
  );
  return data;
}

export async function updateSettings(
  businessId: string,
  input: Partial<BusinessSettings>,
): Promise<BusinessSettings> {
  const { data } = await api.patch<BusinessSettings>(
    `/api/v1/businesses/${businessId}/settings`,
    input,
  );
  return data;
}

export async function listBranchRoles(
  businessId: string,
): Promise<BranchRoleView[]> {
  const { data } = await api.get<BranchRoleView[]>(
    `/api/v1/businesses/${businessId}/settings/branch-roles`,
  );
  return data;
}

export async function setBranchRole(
  businessId: string,
  branchId: string,
  userId: string,
  role: string,
): Promise<void> {
  await api.put(
    `/api/v1/businesses/${businessId}/settings/branch-roles/${branchId}/${userId}`,
    { role },
  );
}

export async function clearBranchRole(
  businessId: string,
  branchId: string,
  userId: string,
): Promise<void> {
  await api.delete(
    `/api/v1/businesses/${businessId}/settings/branch-roles/${branchId}/${userId}`,
  );
}

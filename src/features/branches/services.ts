import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Branch, CreateBranchInput } from "./types";

export async function listBranches(
  businessId: string,
): Promise<PaginatedResult<Branch>> {
  const { data } = await api.get<PaginatedResult<Branch>>(
    `/api/v1/businesses/${businessId}/branches`,
    { params: { limit: 100 } },
  );
  return data;
}

export async function createBranch(
  businessId: string,
  input: CreateBranchInput,
): Promise<Branch> {
  const { data } = await api.post<Branch>(
    `/api/v1/businesses/${businessId}/branches`,
    input,
  );
  return data;
}

export async function setBranchActive(
  businessId: string,
  branchId: string,
  isActive: boolean,
): Promise<Branch> {
  const { data } = await api.patch<Branch>(
    `/api/v1/businesses/${businessId}/branches/${branchId}`,
    { isActive },
  );
  return data;
}

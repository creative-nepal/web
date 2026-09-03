import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { ClaimStatus, InsuranceClaim } from "./types";

export async function listClaims(
  businessId: string,
): Promise<PaginatedResult<InsuranceClaim>> {
  const { data } = await api.get<PaginatedResult<InsuranceClaim>>(
    `/api/v1/businesses/${businessId}/medical/insurance-claims`,
    { params: { limit: 50 } },
  );
  return data;
}

export async function transitionClaim(
  businessId: string,
  claimId: string,
  input: {
    status: ClaimStatus;
    settledAmountCents?: number;
    reference?: string;
    reason?: string;
  },
): Promise<InsuranceClaim> {
  const { data } = await api.patch<InsuranceClaim>(
    `/api/v1/businesses/${businessId}/medical/insurance-claims/${claimId}/status`,
    input,
  );
  return data;
}

export type ClaimStatus = "draft" | "submitted" | "approved" | "rejected";

export interface InsuranceClaim {
  id: string;
  provider: string;
  policyNumber: string;
  claimedAmountCents: number;
  settledAmountCents: number | null;
  reference: string | null;
  reason: string | null;
  status: ClaimStatus;
  createdAt: string;
}

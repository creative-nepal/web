import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Customer, LedgerEntry } from "./types";

export async function listCustomers(
  businessId: string,
  params: { search?: string; owing?: string } = {},
): Promise<PaginatedResult<Customer>> {
  const { data } = await api.get<PaginatedResult<Customer>>(
    `/api/v1/businesses/${businessId}/customers`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function createCustomer(
  businessId: string,
  input: {
    name: string;
    phone?: string;
    email?: string;
    creditLimitCents?: number;
  },
): Promise<Customer> {
  const { data } = await api.post<Customer>(
    `/api/v1/businesses/${businessId}/customers`,
    input,
  );
  return data;
}

export async function getLedger(
  businessId: string,
  customerId: string,
): Promise<PaginatedResult<LedgerEntry>> {
  const { data } = await api.get<PaginatedResult<LedgerEntry>>(
    `/api/v1/businesses/${businessId}/customers/${customerId}/ledger`,
    { params: { limit: 50 } },
  );
  return data;
}

export async function recordPayment(
  businessId: string,
  customerId: string,
  amountCents: number,
  note?: string,
): Promise<LedgerEntry> {
  const { data } = await api.post<LedgerEntry>(
    `/api/v1/businesses/${businessId}/customers/${customerId}/payments`,
    { amountCents, note },
  );
  return data;
}

export interface LoyaltyEntry {
  id: string;
  type: "earned" | "redeemed" | "adjusted";
  points: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
}

export async function redeemPoints(
  businessId: string,
  customerId: string,
  points: number,
): Promise<{ entry: LoyaltyEntry; valueCents: number }> {
  const { data } = await api.post<{
    entry: LoyaltyEntry;
    valueCents: number;
  }>(
    `/api/v1/businesses/${businessId}/customers/${customerId}/loyalty/redeem`,
    { points },
  );
  return data;
}

export interface ReferralSummary {
  customerId: string;
  referralCode: string;
  referredByCustomerId: string | null;
  referredByName: string | null;
  referredCount: number;
  pointsEarned: number;
  rewardPoints: number;
  welcomePoints: number;
}

export async function getReferral(
  businessId: string,
  customerId: string,
): Promise<ReferralSummary> {
  const { data } = await api.get<ReferralSummary>(
    `/api/v1/businesses/${businessId}/customers/${customerId}/referral`,
  );
  return data;
}

export async function claimReferral(
  businessId: string,
  customerId: string,
  code: string,
): Promise<ReferralSummary> {
  const { data } = await api.post<ReferralSummary>(
    `/api/v1/businesses/${businessId}/customers/${customerId}/referral`,
    { code },
  );
  return data;
}

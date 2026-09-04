import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { WastageRecord, WastageReport } from "./types";

export async function listWastage(
  businessId: string,
  params: { reason?: string; limit?: number } = {},
): Promise<PaginatedResult<WastageRecord>> {
  const { data } = await api.get<PaginatedResult<WastageRecord>>(
    `/api/v1/businesses/${businessId}/wastage`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function getWastageReport(
  businessId: string,
): Promise<WastageReport> {
  const { data } = await api.get<WastageReport>(
    `/api/v1/businesses/${businessId}/wastage/report`,
    { params: { sinceDays: 30 } },
  );
  return data;
}

export async function recordWastage(
  businessId: string,
  input: {
    productId?: string;
    menuItemId?: string;
    quantity: number;
    reason: string;
    note?: string;
  },
): Promise<WastageRecord> {
  const { data } = await api.post<WastageRecord>(
    `/api/v1/businesses/${businessId}/wastage`,
    input,
  );
  return data;
}

import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";

export interface Batch {
  id: string;
  productId: string;
  batchNo: string;
  expiryDate: string;
  qty: number;
  costPriceCents: number;
  isActive: boolean;
  isExpired: boolean;
  daysToExpiry: number;
}

export async function listExpiring(
  businessId: string,
  withinDays: number,
  params: { sortBy?: string; sortDirection?: "asc" | "desc" } = {},
): Promise<PaginatedResult<Batch>> {
  const { data } = await api.get<PaginatedResult<Batch>>(
    `/api/v1/businesses/${businessId}/batches/expiring`,
    {
      params: {
        withinDays,
        limit: 100,
        sortBy: "expiryDate",
        sortDirection: "asc",
        ...params,
      },
    },
  );
  return data;
}

export async function listForProduct(
  businessId: string,
  productId: string,
): Promise<Batch[]> {
  const { data } = await api.get<Batch[]>(
    `/api/v1/businesses/${businessId}/products/${productId}/batches`,
  );
  return data;
}

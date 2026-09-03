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

export interface RecallDispense {
  orderId: string;
  invoiceId: string | null;
  invoiceNumber: number | null;
  soldAt: string;
  quantity: number;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
}

export interface RecallReport {
  batch: Batch;
  productName: string;
  remainingQty: number;
  dispensedQty: number;
  dispenses: RecallDispense[];
}

export async function getRecallReport(
  businessId: string,
  batchId: string,
): Promise<RecallReport> {
  const { data } = await api.get<RecallReport>(
    `/api/v1/businesses/${businessId}/medical/batches/${batchId}/recall`,
  );
  return data;
}

export async function quarantineBatch(
  businessId: string,
  batchId: string,
  note?: string,
): Promise<RecallReport> {
  const { data } = await api.post<RecallReport>(
    `/api/v1/businesses/${businessId}/medical/batches/${batchId}/recall`,
    { ...(note ? { note } : {}) },
  );
  return data;
}

import { api } from "@/lib/api";
import type { CheckoutResult } from "./types";

export interface CheckoutPayload {
  items: Array<{
    productId: string;
    quantity: number;
    discountCents?: number;
    note?: string;
  }>;
  discountPercent?: number;
  discountReason?: string;
  channelId?: string;
  source?: string;
  payments?: Array<{
    method: string;
    amountCents: number;
    reference?: string;
  }>;
  customer?: { name: string; phone?: string; panNumber?: string };
  prescription?: {
    doctorName: string;
    patientName: string;
    attachmentFileId?: string;
  };
  buyerIdentity?: { idType: string; idNumber: string };
}

export async function checkout(
  businessId: string,
  payload: CheckoutPayload,
): Promise<CheckoutResult> {
  const { data } = await api.post<CheckoutResult>(
    `/api/v1/businesses/${businessId}/orders`,
    payload,
  );
  return data;
}

export async function printInvoice(
  businessId: string,
  invoiceId: string,
): Promise<{ printedCount: number }> {
  const { data } = await api.post<{ printedCount: number }>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/print`,
    {},
  );
  return data;
}

export interface SubstituteProduct {
  productId: string;
  name: string;
  genericName: string;
  manufacturer: string | null;
  schedule: string | null;
  priceCents: number;
  stockQty: number;
  earliestExpiry: string | null;
}

export interface SubstituteResult {
  productId: string;
  name: string;
  genericName: string | null;
  substitutes: SubstituteProduct[];
}

export async function listSubstitutes(
  businessId: string,
  productId: string,
): Promise<SubstituteResult> {
  const { data } = await api.get<SubstituteResult>(
    `/api/v1/businesses/${businessId}/medical/products/${productId}/substitutes`,
  );
  return data;
}

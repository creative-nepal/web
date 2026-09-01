import { api } from "@/lib/api";
import type { CheckoutResult } from "./types";

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>;
  customer?: { name: string; phone?: string; panNumber?: string };
  prescription?: {
    doctorName: string;
    patientName: string;
    attachmentUrl: string;
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

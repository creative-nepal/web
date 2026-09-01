import { api } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import type { PaginatedResult } from "@/types/api";
import type {
  PurchaseBill,
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
} from "./types";

export interface ListParams {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  status?: string;
  supplierId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listSuppliers(
  businessId: string,
  params: ListParams = {},
): Promise<PaginatedResult<Supplier>> {
  const { data } = await api.get<PaginatedResult<Supplier>>(
    `/api/v1/businesses/${businessId}/suppliers`,
    { params: { limit: 100, ...params } },
  );
  return data;
}

export async function createSupplier(
  businessId: string,
  input: { name: string; panNumber?: string; contact?: string },
): Promise<Supplier> {
  const { data } = await api.post<Supplier>(
    `/api/v1/businesses/${businessId}/suppliers`,
    input,
  );
  return data;
}

export async function listPurchaseOrders(
  businessId: string,
  params: ListParams = {},
): Promise<PaginatedResult<PurchaseOrder>> {
  const { data } = await api.get<PaginatedResult<PurchaseOrder>>(
    `/api/v1/businesses/${businessId}/purchase-orders`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function getPurchaseOrder(
  businessId: string,
  poId: string,
): Promise<{ order: PurchaseOrder; items: PurchaseOrderItem[] }> {
  const { data } = await api.get<{
    order: PurchaseOrder;
    items: PurchaseOrderItem[];
  }>(`/api/v1/businesses/${businessId}/purchase-orders/${poId}`);
  return data;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: Array<{
    productId: string;
    orderedQty: number;
    purchasePriceCents: number;
    batchNo?: string;
    expiryDate?: string;
  }>;
}

export async function createPurchaseOrder(
  businessId: string,
  input: CreatePurchaseOrderInput,
): Promise<{ order: PurchaseOrder; items: PurchaseOrderItem[] }> {
  const { data } = await api.post<{
    order: PurchaseOrder;
    items: PurchaseOrderItem[];
  }>(`/api/v1/businesses/${businessId}/purchase-orders`, input);
  return data;
}

export async function confirmPurchaseOrder(
  businessId: string,
  poId: string,
): Promise<PurchaseOrder> {
  const { data } = await api.post<PurchaseOrder>(
    `/api/v1/businesses/${businessId}/purchase-orders/${poId}/confirm`,
    {},
  );
  return data;
}

export async function receivePurchaseOrder(
  businessId: string,
  poId: string,
  lines: Array<{ purchaseOrderItemId: string; receivedQty: number }>,
): Promise<{ order: PurchaseOrder; items: PurchaseOrderItem[] }> {
  const { data } = await api.post<{
    order: PurchaseOrder;
    items: PurchaseOrderItem[];
  }>(`/api/v1/businesses/${businessId}/purchase-orders/${poId}/receive`, {
    lines,
  });
  return data;
}

export async function listBills(
  businessId: string,
  params: ListParams = {},
): Promise<PaginatedResult<PurchaseBill>> {
  const { data } = await api.get<PaginatedResult<PurchaseBill>>(
    `/api/v1/businesses/${businessId}/purchase-bills`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export interface CreateBillInput {
  supplierId: string;
  billNumber: string;
  billDate: string;
  tdsRateBasisPoints?: number;
  items: Array<{
    description: string;
    quantity?: number;
    unitPriceCents: number;
    vatCents?: number;
  }>;
}

export async function createBill(
  businessId: string,
  input: CreateBillInput,
): Promise<PurchaseBill> {
  const { data } = await api.post<PurchaseBill>(
    `/api/v1/businesses/${businessId}/purchase-bills`,
    input,
  );
  return data;
}

export async function recordPayment(
  businessId: string,
  billId: string,
  amountCents: number,
): Promise<PurchaseBill> {
  const { data } = await api.post<PurchaseBill>(
    `/api/v1/businesses/${businessId}/purchase-bills/${billId}/payments`,
    { amountCents },
  );
  return data;
}

export function downloadPurchaseRegister(
  businessId: string,
  from: string,
  to: string,
  format: "xlsx" | "csv",
): Promise<void> {
  return downloadFile(
    `/api/v1/businesses/${businessId}/purchases/register`,
    { from, to, format },
    `purchase-register.${format}`,
  );
}

export function downloadTdsReturn(
  businessId: string,
  from: string,
  to: string,
  format: "xlsx" | "csv",
): Promise<void> {
  return downloadFile(
    `/api/v1/businesses/${businessId}/purchases/tds-return`,
    { from, to, format },
    `tds-return.${format}`,
  );
}

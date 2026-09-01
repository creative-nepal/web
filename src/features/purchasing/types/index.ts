export interface Supplier {
  id: string;
  name: string;
  panNumber: string | null;
  address: string | null;
  contact: string | null;
  isActive: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  reference: string | null;
  status:
    | "pending"
    | "confirmed"
    | "partially_received"
    | "received"
    | "canceled";
  expectedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  orderedQty: string;
  receivedQty: string;
  purchasePriceCents: number;
  lineTotalCents: number;
  batchNo: string | null;
  expiryDate: string | null;
}

export interface PurchaseBill {
  id: string;
  supplierId: string;
  purchaseOrderId: string | null;
  billNumber: string;
  billDate: string;
  dueDate: string | null;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  tdsRateBasisPoints: number;
  tdsAmountCents: number;
  paidCents: number;
  status: "unpaid" | "partially_paid" | "paid";
}

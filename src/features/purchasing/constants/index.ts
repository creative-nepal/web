import type { PurchaseOrder } from "../types";

export const PURCHASE_ORDER_STATUS_VARIANTS: Record<
  PurchaseOrder["status"],
  "outline" | "secondary" | "default" | "destructive"
> = {
  pending: "outline",
  confirmed: "secondary",
  partially_received: "secondary",
  received: "default",
  canceled: "destructive",
};

export const RECEIVABLE_STATUSES: PurchaseOrder["status"][] = [
  "confirmed",
  "partially_received",
];

export const PURCHASE_BILL_STATUS_VARIANTS = {
  paid: "default",
  partially_paid: "outline",
  unpaid: "outline",
} as const;

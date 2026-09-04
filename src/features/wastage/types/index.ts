export const WASTAGE_REASONS = [
  "spoilage",
  "spillage",
  "expired",
  "preparation_error",
  "customer_return",
  "staff_meal",
  "breakage",
] as const;

export type WastageReason = (typeof WASTAGE_REASONS)[number];

export interface WastageRecord {
  id: string;
  productId: string | null;
  menuItemId: string | null;
  itemName: string;
  quantity: string;
  reason: WastageReason;
  costCents: number;
  note: string | null;
  createdAt: string;
}

export interface WastageReport {
  totalCostCents: number;
  entries: number;
  byReason: Array<{ reason: string; entries: number; costCents: number }>;
  topItems: Array<{ itemName: string; quantity: number; costCents: number }>;
}

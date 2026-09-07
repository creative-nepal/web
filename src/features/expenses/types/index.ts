export const EXPENSE_CATEGORIES = [
  "rent",
  "utilities",
  "salary",
  "gas",
  "repairs",
  "transport",
  "marketing",
  "supplies",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  paidVia: string;
  reference: string | null;
  cashSessionId: string | null;
  incurredAt: string;
  voidedAt: string | null;
  voidReason: string | null;
}

export interface ExpenseFilters {
  category: ExpenseCategory | null;
  includeVoided: boolean;
  from: string;
  to: string;
}

export interface ExpenseReport {
  totalCents: number;
  entries: number;
  byCategory: Array<{
    category: string;
    entries: number;
    amountCents: number;
  }>;
}

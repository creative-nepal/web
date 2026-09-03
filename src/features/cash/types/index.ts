export const PAYMENT_METHODS = [
  "cash",
  "esewa",
  "khalti",
  "fonepay",
  "connectips",
  "card",
  "bank_transfer",
  "credit",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Payment {
  method: PaymentMethod;
  amountCents: number;
  reference?: string;
}

export interface InvoicePayment extends Payment {
  id: string;
  invoiceId: string;
  cashSessionId: string | null;
  createdAt: string;
}

export interface CashSession {
  id: string;
  businessId: string;
  branchId: string;
  status: "open" | "closed";
  openingFloatCents: number;
  openedAt: string;
  countedCashCents: number | null;
  expectedCashCents: number | null;
  varianceCents: number | null;
  closedAt: string | null;
  note: string | null;
}

export interface CashMovement {
  id: string;
  direction: "in" | "out";
  amountCents: number;
  reason: string;
  createdAt: string;
}

export interface MethodTotal {
  method: string;
  amountCents: number;
  count: number;
}

export interface CashSessionSummary {
  session: CashSession;
  methodTotals: MethodTotal[];
  cashSalesCents: number;
  paidInCents: number;
  paidOutCents: number;
  expectedCashCents: number;
  movements: CashMovement[];
}

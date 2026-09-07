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

export const TENDER_METHODS = PAYMENT_METHODS.filter(
  (method) => method !== "credit",
) as readonly Exclude<PaymentMethod, "credit">[];

export type TenderMethod = (typeof TENDER_METHODS)[number];

export const NPR_DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1] as const;

export type DenominationCount = Record<string, number>;

export interface Payment {
  method: TenderMethod;
  amountCents: number;
  reference?: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  cashSessionId: string | null;
  method: string;
  amountCents: number;
  reference: string | null;
  createdAt: string;
}

export interface SettlementResult {
  payments: InvoicePayment[];
  invoiceTotalCents: number;
  paidCents: number;
  dueCents: number;
}

export interface CashSession {
  id: string;
  businessId: string;
  branchId: string;
  status: "open" | "closed";
  openingFloatCents: number;
  openedAt: string;
  countedCashCents: number | null;
  countedDenominations: DenominationCount | null;
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

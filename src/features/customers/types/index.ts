export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  panNumber: string | null;
  loyaltyPoints: number;
  creditLimitCents: number;
  balanceCents: number;
  createdAt: string;
}

export type LedgerEntryType = "sale" | "payment" | "adjustment";

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  amountCents: number;
  balanceAfterCents: number;
  invoiceId: string | null;
  method: string | null;
  cashSessionId: string | null;
  note: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  panNumber: string | null;
  creditLimitCents: number;
  balanceCents: number;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  type: "sale" | "payment" | "adjustment";
  amountCents: number;
  balanceAfterCents: number;
  invoiceId: string | null;
  note: string | null;
  createdAt: string;
}

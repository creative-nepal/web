export const INVOICE_STATUSES = ["issued", "credit_note", "voided"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_SETTLEMENTS = ["unpaid", "partial", "paid"] as const;

export type InvoiceSettlement = (typeof INVOICE_SETTLEMENTS)[number];

export interface Invoice {
  id: string;
  businessId: string;
  branchId: string;
  orderId: string | null;
  invoiceNumber: number;
  fiscalYear: string;
  customerId: string | null;
  customerName: string | null;
  customerPan: string | null;
  subtotalCents: number;
  discountCents: number;
  serviceChargeCents: number;
  vatCents: number;
  totalCents: number;
  status: InvoiceStatus;
  printedCount: number;
  cbmsStatus: string | null;
  creditNoteForInvoiceId: string | null;
  creditedSubtotalCents: number;
  creditableSubtotalCents: number;
  paidCents: number;
  dueCents: number;
  settlement: InvoiceSettlement;
  createdAt: string;
  issuedAtBs: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface InvoiceFilters {
  fiscalYear: string;
  status: InvoiceStatus | null;
  settlement: InvoiceSettlement | null;
  search: string;
}

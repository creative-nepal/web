export interface Invoice {
  id: string;
  businessId: string;
  orderId: string | null;
  invoiceNumber: number;
  fiscalYear: string;
  customerName: string | null;
  customerPan: string | null;
  subtotalCents: number;
  serviceChargeCents: number;
  vatCents: number;
  totalCents: number;
  status: string;
  printedCount: number;
  cbmsStatus: string | null;
  creditNoteForInvoiceId: string | null;
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

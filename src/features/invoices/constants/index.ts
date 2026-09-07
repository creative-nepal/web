export const INVOICES_PAGE_SIZE = 20;

export const INVOICE_STATUS_VARIANTS = {
  issued: "outline",
  credit_note: "secondary",
  voided: "destructive",
} as const;

export const INVOICE_SETTLEMENT_VARIANTS = {
  unpaid: "destructive",
  partial: "secondary",
  paid: "outline",
} as const;

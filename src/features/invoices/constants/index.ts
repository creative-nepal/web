export const INVOICES_PAGE_SIZE = 20;

export const INVOICE_STATUS_VARIANTS = {
  issued: "outline",
  credit_note: "secondary",
  voided: "destructive",
} as const;

export const INVOICE_STATUS_LABELS = {
  issued: "Issued",
  credit_note: "Credit note",
  voided: "Voided",
} as const;

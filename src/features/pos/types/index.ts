import type { Product } from "@/features/products/types";

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface CheckoutInvoice {
  id: string;
  invoiceNumber: number;
  fiscalYear: string;
  issuedAtBs: string;
  subtotalCents: number;
  serviceChargeCents: number;
  vatCents: number;
  totalCents: number;
  printedCount: number;
}

export interface CheckoutResult {
  id: string;
  status: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  invoice: CheckoutInvoice | null;
}

export interface ComplianceState {
  buyerName: string;
  buyerPan: string;
  doctorName: string;
  patientName: string;
  idNumber: string;
}

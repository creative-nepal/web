export const RECEIPT_WIDTHS = ["58mm", "80mm", "a4"] as const;
export type ReceiptWidth = (typeof RECEIPT_WIDTHS)[number];

export interface BusinessSettings {
  businessId: string;
  contactPhone: string | null;
  contactEmail: string | null;
  addressLine: string | null;
  website: string | null;
  invoiceFooter: string | null;
  receiptWidth: ReceiptWidth;
  showLogoOnReceipt: boolean;
  timezone: string;
  defaultLocale: "en" | "ne";
  digestEnabled: boolean;
  digestHour: number;
  lowStockAlertsEnabled: boolean;
  expiryAlertsEnabled: boolean;
}

export interface BranchRoleView {
  branchId: string;
  branchName: string;
  userId: string;
  role: string;
}

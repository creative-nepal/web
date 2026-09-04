import { api } from "@/lib/api";

export interface LiveSalesTotals {
  invoices: number;
  grossCents: number;
  creditNoteCents: number;
  netCents: number;
  discountCents: number;
  serviceChargeCents: number;
  vatCents: number;
  averageTicketCents: number;
}

export interface LiveSalesReport {
  businessDate: string;
  timezone: string;
  generatedAt: string;
  totals: LiveSalesTotals;
  byHour: Array<{ hour: number; invoices: number; netCents: number }>;
  byPaymentMethod: Array<{
    method: string;
    payments: number;
    amountCents: number;
  }>;
  topItems: Array<{ name: string; quantity: number; revenueCents: number }>;
  open: { orders: number; valueCents: number };
}

export async function getLiveSales(
  businessId: string,
  businessDate?: string,
): Promise<LiveSalesReport> {
  const { data } = await api.get<LiveSalesReport>(
    `/api/v1/businesses/${businessId}/live-sales`,
    { params: businessDate ? { businessDate } : {} },
  );
  return data;
}

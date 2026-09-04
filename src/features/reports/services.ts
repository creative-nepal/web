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

export type ReportFormat = "xlsx" | "csv";

export interface ProfitLine {
  productId: string | null;
  name: string;
  quantity: number;
  revenueCents: number;
  costCents: number;
  profitCents: number;
  marginPercent: number;
}

export interface ProfitReport {
  from: string;
  to: string;
  totals: {
    revenueCents: number;
    costCents: number;
    profitCents: number;
    marginPercent: number;
  };
  lines: ProfitLine[];
  uncosted: number;
}

export interface PartyAging {
  partyId: string;
  name: string;
  phone: string | null;
  currentCents: number;
  days31To60Cents: number;
  days61To90Cents: number;
  over90Cents: number;
  totalCents: number;
  oldestDays: number;
}

export interface AgingReport {
  asOf: string;
  parties: PartyAging[];
  totals: Omit<PartyAging, "partyId" | "name" | "phone">;
}

export interface StockMovementReport {
  productId: string;
  name: string;
  unitType: string;
  from: string;
  to: string;
  openingQty: number;
  closingQty: number;
  inQty: number;
  outQty: number;
  movements: Array<{
    id: string;
    at: string;
    source: "purchase" | "sale" | "wastage" | "adjustment";
    reference: string | null;
    note: string | null;
    quantity: number;
    runningQty: number;
  }>;
}

export async function getProfit(
  businessId: string,
  from: string,
  to: string,
): Promise<ProfitReport> {
  const { data } = await api.get<ProfitReport>(
    `/api/v1/businesses/${businessId}/reports/profit`,
    { params: { from, to } },
  );
  return data;
}

export async function getAging(
  businessId: string,
  kind: "receivables" | "payables",
  asOf: string,
): Promise<AgingReport> {
  const { data } = await api.get<AgingReport>(
    `/api/v1/businesses/${businessId}/reports/${kind}`,
    { params: asOf ? { asOf } : {} },
  );
  return data;
}

export async function getStockMovement(
  businessId: string,
  productId: string,
  from: string,
  to: string,
): Promise<StockMovementReport> {
  const { data } = await api.get<StockMovementReport>(
    `/api/v1/businesses/${businessId}/reports/stock-movement`,
    { params: { productId, from, to } },
  );
  return data;
}

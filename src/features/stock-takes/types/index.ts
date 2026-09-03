export type StockTakeStatus = "open" | "completed" | "cancelled";

export interface StockTakeLine {
  id: string;
  productId: string;
  productName: string;
  batchId: string | null;
  batchNo: string | null;
  systemQty: number;
  countedQty: number | null;
  varianceQty: number | null;
  countedAt: string | null;
}

export interface StockTake {
  id: string;
  businessId: string;
  branchId: string;
  reference: string;
  status: StockTakeStatus;
  note: string | null;
  closedAt: string | null;
  createdAt: string;
}

export interface StockTakeDetail extends StockTake {
  lines: StockTakeLine[];
  countedLines: number;
  varianceLines: number;
}

export interface StockTakeOutcome {
  stockTake: StockTake;
  appliedLines: number;
  netVariance: number;
}

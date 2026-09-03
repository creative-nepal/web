import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { StockTake, StockTakeDetail, StockTakeOutcome } from "./types";

export interface ListStockTakesParams {
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function listStockTakes(
  businessId: string,
  params: ListStockTakesParams = {},
): Promise<PaginatedResult<StockTake>> {
  const { data } = await api.get<PaginatedResult<StockTake>>(
    `/api/v1/businesses/${businessId}/stock-takes`,
    { params },
  );
  return data;
}

export async function getStockTake(
  businessId: string,
  stockTakeId: string,
): Promise<StockTakeDetail> {
  const { data } = await api.get<StockTakeDetail>(
    `/api/v1/businesses/${businessId}/stock-takes/${stockTakeId}`,
  );
  return data;
}

export async function openStockTake(
  businessId: string,
  input: { reference: string; note?: string },
): Promise<StockTakeDetail> {
  const { data } = await api.post<StockTakeDetail>(
    `/api/v1/businesses/${businessId}/stock-takes`,
    input,
  );
  return data;
}

export async function recordCounts(
  businessId: string,
  stockTakeId: string,
  lines: Array<{ lineId: string; countedQty: number }>,
): Promise<StockTakeDetail> {
  const { data } = await api.post<StockTakeDetail>(
    `/api/v1/businesses/${businessId}/stock-takes/${stockTakeId}/counts`,
    { lines },
  );
  return data;
}

export async function completeStockTake(
  businessId: string,
  stockTakeId: string,
  note?: string,
): Promise<StockTakeOutcome> {
  const { data } = await api.post<StockTakeOutcome>(
    `/api/v1/businesses/${businessId}/stock-takes/${stockTakeId}/complete`,
    { ...(note ? { note } : {}) },
  );
  return data;
}

export async function cancelStockTake(
  businessId: string,
  stockTakeId: string,
): Promise<StockTake> {
  const { data } = await api.post<StockTake>(
    `/api/v1/businesses/${businessId}/stock-takes/${stockTakeId}/cancel`,
    {},
  );
  return data;
}

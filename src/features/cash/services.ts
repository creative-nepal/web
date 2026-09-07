import { api } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import type { PaginatedResult } from "@/types/api";
import type {
  CashMovement,
  CashSession,
  CashSessionSummary,
  DenominationCount,
  InvoicePayment,
  Payment,
  SettlementResult,
} from "./types";

export async function getCurrentSession(
  businessId: string,
): Promise<CashSessionSummary | null> {
  const { data } = await api.get<CashSessionSummary | null>(
    `/api/v1/businesses/${businessId}/cash-sessions/current`,
  );
  return data ?? null;
}

export async function listSessions(
  businessId: string,
  params: { status?: string; limit?: number; offset?: number } = {},
): Promise<PaginatedResult<CashSession>> {
  const { data } = await api.get<PaginatedResult<CashSession>>(
    `/api/v1/businesses/${businessId}/cash-sessions`,
    { params },
  );
  return data;
}

export async function getSession(
  businessId: string,
  sessionId: string,
): Promise<CashSessionSummary> {
  const { data } = await api.get<CashSessionSummary>(
    `/api/v1/businesses/${businessId}/cash-sessions/${sessionId}`,
  );
  return data;
}

export async function listSessionPayments(
  businessId: string,
  sessionId: string,
): Promise<InvoicePayment[]> {
  const { data } = await api.get<InvoicePayment[]>(
    `/api/v1/businesses/${businessId}/cash-sessions/${sessionId}/payments`,
  );
  return data;
}

export function downloadSessions(
  businessId: string,
  format: "xlsx" | "csv",
  status?: string,
): Promise<void> {
  return downloadFile(
    `/api/v1/businesses/${businessId}/cash-sessions/export`,
    { format, ...(status ? { status } : {}) },
    `cash-sessions.${format}`,
  );
}

export async function openSession(
  businessId: string,
  openingFloatCents: number,
): Promise<CashSession> {
  const { data } = await api.post<CashSession>(
    `/api/v1/businesses/${businessId}/cash-sessions`,
    { openingFloatCents },
  );
  return data;
}

export async function addMovement(
  businessId: string,
  sessionId: string,
  input: { direction: "in" | "out"; amountCents: number; reason: string },
): Promise<CashMovement> {
  const { data } = await api.post<CashMovement>(
    `/api/v1/businesses/${businessId}/cash-sessions/${sessionId}/movements`,
    input,
  );
  return data;
}

export async function closeSession(
  businessId: string,
  sessionId: string,
  input: {
    countedCashCents?: number;
    denominations?: DenominationCount;
    note?: string;
  },
): Promise<CashSessionSummary> {
  const { data } = await api.post<CashSessionSummary>(
    `/api/v1/businesses/${businessId}/cash-sessions/${sessionId}/close`,
    input,
  );
  return data;
}

export async function listInvoicePayments(
  businessId: string,
  invoiceId: string,
): Promise<InvoicePayment[]> {
  const { data } = await api.get<InvoicePayment[]>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/payments`,
  );
  return data;
}

export async function settleInvoice(
  businessId: string,
  invoiceId: string,
  payments: Payment[],
): Promise<SettlementResult> {
  const { data } = await api.post<SettlementResult>(
    `/api/v1/businesses/${businessId}/invoices/${invoiceId}/payments`,
    { payments },
  );
  return data;
}

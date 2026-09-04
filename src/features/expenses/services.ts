import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Expense, ExpenseReport } from "./types";

export async function listExpenses(
  businessId: string,
  params: { category?: string; limit?: number } = {},
): Promise<PaginatedResult<Expense>> {
  const { data } = await api.get<PaginatedResult<Expense>>(
    `/api/v1/businesses/${businessId}/expenses`,
    { params: { limit: 50, ...params } },
  );
  return data;
}

export async function getExpenseReport(
  businessId: string,
): Promise<ExpenseReport> {
  const { data } = await api.get<ExpenseReport>(
    `/api/v1/businesses/${businessId}/expenses/report`,
    { params: { sinceDays: 30 } },
  );
  return data;
}

export async function createExpense(
  businessId: string,
  input: {
    category: string;
    description: string;
    amountCents: number;
    paidVia: string;
    reference?: string;
  },
): Promise<Expense> {
  const { data } = await api.post<Expense>(
    `/api/v1/businesses/${businessId}/expenses`,
    input,
  );
  return data;
}

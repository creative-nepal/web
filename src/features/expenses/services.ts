import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Expense, ExpenseFilters, ExpenseReport } from "./types";

export async function listExpenses(
  businessId: string,
  filters: ExpenseFilters,
  params: { limit: number; offset: number },
): Promise<PaginatedResult<Expense>> {
  const { data } = await api.get<PaginatedResult<Expense>>(
    `/api/v1/businesses/${businessId}/expenses`,
    {
      params: {
        ...params,
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.includeVoided ? { includeVoided: "true" } : {}),
        ...(filters.from ? { from: new Date(filters.from).toISOString() } : {}),
        ...(filters.to ? { to: new Date(filters.to).toISOString() } : {}),
      },
    },
  );
  return data;
}

export async function voidExpense(
  businessId: string,
  expenseId: string,
  reason: string,
): Promise<Expense> {
  const { data } = await api.post<Expense>(
    `/api/v1/businesses/${businessId}/expenses/${expenseId}/void`,
    { reason },
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

import { queryOptions } from "@tanstack/react-query";
import { getExpenseReport, listExpenses } from "./services";
import type { ExpenseFilters } from "./types";

export const EXPENSES_PAGE_SIZE = 25;

export const expenseQueryKeys = {
  all: ["expenses"] as const,
  list: (businessId: string, filters: ExpenseFilters, page: number) =>
    [...expenseQueryKeys.all, "list", businessId, filters, page] as const,
  report: (businessId: string) =>
    [...expenseQueryKeys.all, "report", businessId] as const,
};

export function expensesQueryOptions(
  businessId: string,
  filters: ExpenseFilters,
  page: number,
) {
  return queryOptions({
    queryKey: expenseQueryKeys.list(businessId, filters, page),
    queryFn: () =>
      listExpenses(businessId, filters, {
        limit: EXPENSES_PAGE_SIZE,
        offset: page * EXPENSES_PAGE_SIZE,
      }),
    enabled: Boolean(businessId),
    placeholderData: (previous) => previous,
  });
}

export function expenseReportQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: expenseQueryKeys.report(businessId),
    queryFn: () => getExpenseReport(businessId),
    enabled: Boolean(businessId),
  });
}

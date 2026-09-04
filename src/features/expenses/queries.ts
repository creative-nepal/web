import { queryOptions } from "@tanstack/react-query";
import { getExpenseReport, listExpenses } from "./services";

export const expenseQueryKeys = {
  all: ["expenses"] as const,
  list: (businessId: string) =>
    [...expenseQueryKeys.all, "list", businessId] as const,
  report: (businessId: string) =>
    [...expenseQueryKeys.all, "report", businessId] as const,
};

export function expensesQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: expenseQueryKeys.list(businessId),
    queryFn: () => listExpenses(businessId),
    enabled: Boolean(businessId),
  });
}

export function expenseReportQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: expenseQueryKeys.report(businessId),
    queryFn: () => getExpenseReport(businessId),
    enabled: Boolean(businessId),
  });
}

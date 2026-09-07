"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { SelectFilter } from "@/components/composed/select-filter";
import { PaginationControls } from "@/components/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { TENDER_METHODS, type TenderMethod } from "@/features/cash/types";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { money, parseAmountToCents } from "@/lib/money";
import { VoidExpenseDialog } from "../components/void-expense-dialog";
import {
  EXPENSES_PAGE_SIZE,
  expenseQueryKeys,
  expenseReportQueryOptions,
  expensesQueryOptions,
} from "../queries";
import { createExpense } from "../services";
import {
  EXPENSE_CATEGORIES,
  type Expense,
  type ExpenseCategory,
  type ExpenseFilters,
} from "../types";

const EMPTY_FILTERS: ExpenseFilters = {
  category: null,
  includeVoided: false,
  from: "",
  to: "",
};

export function ExpensesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidVia, setPaidVia] = useState<TenderMethod>("cash");
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [voidFor, setVoidFor] = useState<Expense | null>(null);

  const amountCents = amount.trim() === "" ? null : parseAmountToCents(amount);

  const { data: expenses } = useQuery(
    expensesQueryOptions(business?.id ?? "", filters, page),
  );
  const { data: report } = useQuery(
    expenseReportQueryOptions(business?.id ?? ""),
  );

  function update(patch: Partial<ExpenseFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  }

  const add = useMutation({
    mutationFn: () =>
      createExpense(business?.id ?? "", {
        category,
        description: description.trim(),
        amountCents: amountCents ?? 0,
        paidVia,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["cash"] });
      setDescription("");
      setAmount("");
      toast.success(t("ui.web.expenses.added"));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t("ui.error.generic"))),
  });

  if (!business) {
    return null;
  }

  const rows = expenses?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.expenses.title")}
        description={t("ui.web.expenses.description")}
        actions={<ExportMenu businessId={business.id} resource="expenses" />}
      />

      <Can permission={{ expense: ["record"] }}>
        <Card>
          <CardHeader>
            <CardTitle>{t("ui.web.expenses.add")}</CardTitle>
            <CardDescription>{t("ui.web.expenses.tillNote")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-2">
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {t(`common.expenseCategory.${entry}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("ui.web.expenses.descriptionField")}
              className="max-w-64"
            />
            <div className="flex flex-col gap-1">
              <Input
                inputMode="decimal"
                value={amount}
                aria-invalid={amount.trim() !== "" && amountCents === null}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={t("ui.web.expenses.amount")}
                className="max-w-32"
              />
              {amount.trim() !== "" && amountCents === null && (
                <p className="text-destructive text-xs">
                  {t("ui.web.expenses.amountInvalid")}
                </p>
              )}
            </div>
            <Select
              value={paidVia}
              onValueChange={(value) => setPaidVia(value as TenderMethod)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TENDER_METHODS.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {t(`common.paymentMethod.${entry}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={
                !description.trim() ||
                amountCents === null ||
                amountCents === 0 ||
                add.isPending
              }
              onClick={() => add.mutate()}
            >
              {t("ui.web.expenses.add")}
            </Button>
          </CardContent>
        </Card>
      </Can>

      {(report?.entries ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t("ui.web.expenses.total")} · {t("ui.web.expenses.last30")}
            </CardTitle>
            <CardDescription className="font-medium text-foreground text-lg tabular-nums">
              {money(report?.totalCents ?? 0)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {(report?.byCategory ?? []).map((row) => (
              <div key={row.category} className="flex flex-col">
                <span className="text-muted-foreground text-xs">
                  {t(`common.expenseCategory.${row.category}`)}
                </span>
                <span className="font-medium tabular-nums">
                  {money(row.amountCents)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <SelectFilter
          className="w-40"
          value={filters.category}
          onValueChange={(next) =>
            update({ category: next as ExpenseCategory | null })
          }
          allLabel={t("ui.web.expenses.filterCategory")}
          options={EXPENSE_CATEGORIES.map((entry) => ({
            value: entry,
            label: t(`common.expenseCategory.${entry}`),
          }))}
        />
        <div className="flex flex-col gap-1">
          <Label htmlFor="expensesFrom">{t("ui.web.expenses.from")}</Label>
          <Input
            id="expensesFrom"
            type="date"
            value={filters.from}
            onChange={(event) => update({ from: event.target.value })}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="expensesTo">{t("ui.web.expenses.to")}</Label>
          <Input
            id="expensesTo"
            type="date"
            value={filters.to}
            onChange={(event) => update({ to: event.target.value })}
            className="w-40"
          />
        </div>
        <Button
          variant={filters.includeVoided ? "default" : "outline"}
          onClick={() => update({ includeVoided: !filters.includeVoided })}
        >
          {t("ui.web.expenses.showVoided")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setFilters(EMPTY_FILTERS);
            setPage(0);
          }}
        >
          {t("ui.action.clear")}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.expenses.empty")}
          description={t("ui.web.expenses.emptyHint")}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ui.field.when")}</TableHead>
                <TableHead>{t("ui.web.expenses.category")}</TableHead>
                <TableHead>{t("ui.web.expenses.descriptionField")}</TableHead>
                <TableHead>{t("ui.web.expenses.paidVia")}</TableHead>
                <TableHead className="text-right">
                  {t("ui.web.expenses.amount")}
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((expense) => (
                <TableRow
                  key={expense.id}
                  className={expense.voidedAt ? "opacity-60" : undefined}
                >
                  <TableCell className="text-sm">
                    {new Date(expense.incurredAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {t(`common.expenseCategory.${expense.category}`)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          expense.voidedAt ? "line-through" : undefined
                        }
                      >
                        {expense.description}
                      </span>
                      {expense.voidedAt && (
                        <Badge variant="destructive">
                          {t("ui.web.expenses.voidedBadge")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {t(`common.paymentMethod.${expense.paidVia}`)}
                      {expense.cashSessionId && (
                        <Badge variant="outline">
                          {t("ui.web.expenses.fromTill")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {money(expense.amountCents)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      {!expense.voidedAt && (
                        <Can permission={{ expense: ["record"] }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setVoidFor(expense)}
                          >
                            {t("ui.action.void")}
                          </Button>
                        </Can>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            pageSize={EXPENSES_PAGE_SIZE}
            total={expenses?.total ?? 0}
            onPageChange={setPage}
          />
        </>
      )}

      {voidFor && (
        <VoidExpenseDialog
          businessId={business.id}
          expense={voidFor}
          onClose={() => setVoidFor(null)}
        />
      )}
    </div>
  );
}

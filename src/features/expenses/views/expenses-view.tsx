"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
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
import { PAYMENT_METHODS } from "@/features/cash/types";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { money } from "@/lib/money";
import {
  expenseQueryKeys,
  expenseReportQueryOptions,
  expensesQueryOptions,
} from "../queries";
import { createExpense } from "../services";
import { EXPENSE_CATEGORIES } from "../types";

export function ExpensesView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>("other");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidVia, setPaidVia] = useState<string>("cash");

  const { data: expenses } = useQuery(expensesQueryOptions(business?.id ?? ""));
  const { data: report } = useQuery(
    expenseReportQueryOptions(business?.id ?? ""),
  );

  const add = useMutation({
    mutationFn: () =>
      createExpense(business?.id ?? "", {
        category,
        description: description.trim(),
        amountCents: Math.round(Number(amount) * 100),
        paidVia,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all });
      setDescription("");
      setAmount("");
      toast.success(t("ui.web.expenses.added"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
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
              onValueChange={(value) => setCategory(value ?? "other")}
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
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={t("ui.web.expenses.amount")}
              className="max-w-32"
            />
            <Select
              value={paidVia}
              onValueChange={(value) => setPaidVia(value ?? "cash")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.filter((entry) => entry !== "credit").map(
                  (entry) => (
                    <SelectItem key={entry} value={entry}>
                      {t(`common.paymentMethod.${entry}`)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button
              disabled={!description.trim() || amount === "" || add.isPending}
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

      {rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.expenses.empty")}
          description={t("ui.web.expenses.emptyHint")}
        />
      ) : (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-sm">
                  {new Date(expense.incurredAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {t(`common.expenseCategory.${expense.category}`)}
                </TableCell>
                <TableCell className="font-medium">
                  {expense.description}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

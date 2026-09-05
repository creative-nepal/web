"use client";

import { Amount } from "@/components/composed/amount";
import { SummaryList } from "@/components/summary-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import type { CashSessionSummary } from "../types";

export function SessionSummary({ summary }: { summary: CashSessionSummary }) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>{t("ui.web.cash.paymentMix")}</CardTitle>
          <CardDescription>
            {t("ui.web.cash.openedAt")}{" "}
            {new Date(summary.session.openedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ui.web.cash.method")}</TableHead>
                <TableHead className="text-right">
                  {t("ui.web.cash.transactions")}
                </TableHead>
                <TableHead className="text-right">
                  {t("ui.web.cash.amount")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.methodTotals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-sm"
                  >
                    —
                  </TableCell>
                </TableRow>
              ) : (
                summary.methodTotals.map((total) => (
                  <TableRow key={total.method}>
                    <TableCell>
                      {t(`common.paymentMethod.${total.method}`)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {total.count}
                    </TableCell>
                    <TableCell className="text-right">
                      <Amount cents={total.amountCents} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {summary.movements.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              <h3 className="font-medium text-sm">
                {t("ui.web.cash.movements")}
              </h3>
              {summary.movements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {movement.reason}
                  </span>
                  <span className="font-mono tabular-nums">
                    {movement.direction === "out" ? "−" : "+"}
                    {money(movement.amountCents)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardContent className="pt-6">
          <SummaryList
            rows={[
              {
                label: t("ui.web.cash.openingFloat"),
                value: money(summary.session.openingFloatCents),
              },
              {
                label: t("ui.web.cash.cashSales"),
                value: money(summary.cashSalesCents),
              },
              ...(summary.paidInCents > 0
                ? [
                    {
                      label: t("ui.web.cash.paidIn"),
                      value: money(summary.paidInCents),
                    },
                  ]
                : []),
              ...(summary.paidOutCents > 0
                ? [
                    {
                      label: t("ui.web.cash.paidOut"),
                      value: `− ${money(summary.paidOutCents)}`,
                    },
                  ]
                : []),
              {
                label: t("ui.web.cash.expected"),
                value: money(summary.expectedCashCents),
                emphasis: true,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

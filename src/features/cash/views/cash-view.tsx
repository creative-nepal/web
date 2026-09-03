"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { SummaryList } from "@/components/summary-list";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { money } from "@/lib/money";
import { CloseTillDialog } from "../components/close-till-dialog";
import { MovementDialog } from "../components/movement-dialog";
import {
  cashQueryKeys,
  cashSessionsQueryOptions,
  currentSessionQueryOptions,
} from "../queries";
import { openSession } from "../services";

export function CashView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [float, setFloat] = useState("");
  const [closing, setClosing] = useState(false);
  const [moving, setMoving] = useState(false);

  const { data: summary } = useQuery(
    currentSessionQueryOptions(business?.id ?? ""),
  );
  const { data: history } = useQuery(
    cashSessionsQueryOptions(business?.id ?? ""),
  );

  const open = useMutation({
    mutationFn: () =>
      openSession(business?.id ?? "", Math.round(Number(float) * 100)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cashQueryKeys.all });
      setFloat("");
      toast.success(t("ui.web.cash.opened"));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.cash.title")}
        description={t("ui.web.cash.description")}
        actions={
          summary && (
            <div className="flex gap-2">
              <Can permission={{ cash: ["move"] }}>
                <Button variant="outline" onClick={() => setMoving(true)}>
                  {t("ui.web.cash.addMovement")}
                </Button>
              </Can>
              <Can permission={{ cash: ["close"] }}>
                <Button onClick={() => setClosing(true)}>
                  {t("ui.web.cash.close")}
                </Button>
              </Can>
            </div>
          )
        }
      />

      {!summary ? (
        <Can
          permission={{ cash: ["open"] }}
          fallback={
            <EmptyState
              title={t("ui.web.cash.noSession")}
              description={t("ui.web.cash.noSessionHint")}
            />
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("ui.web.cash.openTitle")}</CardTitle>
              <CardDescription>
                {t("ui.web.cash.openingFloatHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="float">{t("ui.web.cash.openingFloat")}</Label>
                <Input
                  id="float"
                  type="number"
                  min={0}
                  value={float}
                  onChange={(event) => setFloat(event.target.value)}
                  className="max-w-40"
                />
              </div>
              <Button
                disabled={float === "" || open.isPending}
                onClick={() => open.mutate()}
              >
                {t("ui.web.cash.open")}
              </Button>
            </CardContent>
          </Card>
        </Can>
      ) : (
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
                        <TableCell className="text-right tabular-nums">
                          {money(total.amountCents)}
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
                      <span className="tabular-nums">
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
      )}

      {(history?.data.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("ui.web.cash.history")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ui.web.cash.closedAt")}</TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.cash.expected")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.cash.counted")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("ui.web.cash.variance")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history?.data ?? []).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="text-sm">
                      {session.closedAt
                        ? new Date(session.closedAt).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(session.expectedCashCents ?? 0)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(session.countedCashCents ?? 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.varianceCents === 0 ? (
                        <Badge variant="outline">
                          {t("ui.web.cash.balanced")}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {money(Math.abs(session.varianceCents ?? 0))}{" "}
                          {(session.varianceCents ?? 0) < 0
                            ? t("ui.web.cash.short")
                            : t("ui.web.cash.over")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {summary && (
        <>
          <CloseTillDialog
            businessId={business.id}
            summary={summary}
            open={closing}
            onOpenChange={setClosing}
          />
          <MovementDialog
            businessId={business.id}
            sessionId={summary.session.id}
            open={moving}
            onOpenChange={setMoving}
          />
        </>
      )}
    </div>
  );
}

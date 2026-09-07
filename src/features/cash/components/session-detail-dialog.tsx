"use client";

import { useQuery } from "@tanstack/react-query";
import { Amount } from "@/components/composed/amount";
import { ContentDialog } from "@/components/composed/content-dialog";
import { SummaryList } from "@/components/summary-list";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import type { Translate } from "@/features/i18n/types";
import { money } from "@/lib/money";
import {
  cashSessionPaymentsQueryOptions,
  cashSessionQueryOptions,
} from "../queries";

export function SessionDetailDialog({
  businessId,
  sessionId,
  onClose,
}: {
  businessId: string;
  sessionId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const { data: summary } = useQuery(
    cashSessionQueryOptions(businessId, sessionId),
  );
  const { data: payments } = useQuery(
    cashSessionPaymentsQueryOptions(businessId, sessionId),
  );

  const session = summary?.session;

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t("ui.web.cash.sessionDetail")}
      description={
        session
          ? `${t("ui.web.cash.openedAt")} ${new Date(session.openedAt).toLocaleString()}`
          : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {summary && (
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
              {
                label: t("ui.web.cash.paidIn"),
                value: money(summary.paidInCents),
              },
              {
                label: t("ui.web.cash.paidOut"),
                value: `− ${money(summary.paidOutCents)}`,
              },
              {
                label: t("ui.web.cash.expected"),
                value: money(summary.expectedCashCents),
                emphasis: true,
              },
              ...(summary.session.countedCashCents === null
                ? []
                : [
                    {
                      label: t("ui.web.cash.counted"),
                      value: money(summary.session.countedCashCents),
                    },
                    {
                      label: t("ui.web.cash.variance"),
                      value: varianceLabel(
                        summary.session.varianceCents ?? 0,
                        t,
                      ),
                    },
                  ]),
            ]}
          />
        )}

        {summary?.session.countedDenominations && (
          <div className="flex flex-col gap-1">
            <h3 className="font-medium text-sm">
              {t("ui.web.cash.byDenomination")}
            </h3>
            {Object.entries(summary.session.countedDenominations)
              .filter(([, count]) => count > 0)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([face, count]) => (
                <div
                  key={face}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground tabular-nums">
                    {money(Number(face) * 100)} × {count}
                  </span>
                  <span className="tabular-nums">
                    {money(Number(face) * 100 * count)}
                  </span>
                </div>
              ))}
          </div>
        )}

        {(summary?.movements.length ?? 0) > 0 && (
          <div className="flex flex-col gap-1">
            <h3 className="font-medium text-sm">
              {t("ui.web.cash.movements")}
            </h3>
            {(summary?.movements ?? []).map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{movement.reason}</span>
                <span className="font-mono tabular-nums">
                  {movement.direction === "out" ? "−" : "+"}
                  {money(movement.amountCents)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-sm">
            {t("ui.web.cash.sessionPayments")}
          </h3>
          {(payments?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("ui.web.cash.noPayments")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ui.field.when")}</TableHead>
                  <TableHead>{t("ui.web.cash.method")}</TableHead>
                  <TableHead>{t("ui.web.cash.reference")}</TableHead>
                  <TableHead className="text-right">
                    {t("ui.field.amount")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payments ?? []).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">
                      {new Date(payment.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {t(`common.paymentMethod.${payment.method}`)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {payment.reference ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Amount cents={payment.amountCents} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </ContentDialog>
  );
}

function varianceLabel(varianceCents: number, t: Translate): string {
  if (varianceCents === 0) {
    return t("ui.web.cash.balanced");
  }

  return `${money(Math.abs(varianceCents))} ${
    varianceCents < 0 ? t("ui.web.cash.short") : t("ui.web.cash.over")
  }`;
}

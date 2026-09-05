"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { OpenTillCard } from "../components/open-till-card";
import { SessionSummary } from "../components/session-summary";
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
          <OpenTillCard
            float={float}
            isPending={open.isPending}
            onFloatChange={setFloat}
            onOpen={() => open.mutate()}
          />
        </Can>
      ) : (
        <SessionSummary summary={summary} />
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

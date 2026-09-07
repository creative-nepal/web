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
import { money, parseAmountToCents } from "@/lib/money";
import { CloseTillDialog } from "../components/close-till-dialog";
import { MovementDialog } from "../components/movement-dialog";
import { OpenTillCard } from "../components/open-till-card";
import { SessionDetailDialog } from "../components/session-detail-dialog";
import { SessionSummary } from "../components/session-summary";
import {
  CASH_SESSIONS_PAGE_SIZE,
  cashQueryKeys,
  cashSessionsQueryOptions,
  currentSessionQueryOptions,
} from "../queries";
import { downloadSessions, openSession } from "../services";

export function CashView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [float, setFloat] = useState("");
  const [closing, setClosing] = useState(false);
  const [moving, setMoving] = useState(false);
  const [status, setStatus] = useState<string | null>("closed");
  const [page, setPage] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: summary } = useQuery(
    currentSessionQueryOptions(business?.id ?? ""),
  );
  const { data: history } = useQuery(
    cashSessionsQueryOptions(business?.id ?? "", status ?? "", page),
  );

  const open = useMutation({
    mutationFn: () =>
      openSession(business?.id ?? "", parseAmountToCents(float) ?? 0),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cashQueryKeys.all });
      setFloat("");
      toast.success(t("ui.web.cash.opened"));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t("ui.error.generic"))),
  });

  if (!business) {
    return null;
  }

  const sessions = history?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.cash.title")}
        description={t("ui.web.cash.description")}
        actions={
          <div className="flex gap-2">
            {(["xlsx", "csv"] as const).map((format) => (
              <Button
                key={format}
                variant="outline"
                onClick={() =>
                  downloadSessions(business.id, format, status ?? undefined)
                }
              >
                {t("ui.web.cash.exportSessions")} (
                {format === "xlsx" ? "Excel" : "CSV"})
              </Button>
            ))}
            {summary && (
              <>
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
              </>
            )}
          </div>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{t("ui.web.cash.history")}</CardTitle>
          <SelectFilter
            className="w-40"
            value={status}
            onValueChange={(next) => {
              setStatus(next);
              setPage(0);
            }}
            allLabel={t("ui.web.cash.allSessions")}
            options={[
              { value: "open", label: t("ui.web.cash.openSessions") },
              { value: "closed", label: t("ui.web.cash.closedSessions") },
            ]}
          />
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <EmptyState
              title={t("ui.web.cash.noHistory")}
              description={t("ui.web.cash.sessionsEmpty")}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ui.web.cash.openedAt")}</TableHead>
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
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="text-sm">
                        {new Date(session.openedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {session.closedAt
                          ? new Date(session.closedAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {session.expectedCashCents === null
                          ? "—"
                          : money(session.expectedCashCents)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {session.countedCashCents === null
                          ? "—"
                          : money(session.countedCashCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        <VarianceBadge varianceCents={session.varianceCents} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailId(session.id)}
                          >
                            {t("ui.web.cash.viewSession")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls
                page={page}
                pageSize={CASH_SESSIONS_PAGE_SIZE}
                total={history?.total ?? 0}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>

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

      {detailId && (
        <SessionDetailDialog
          businessId={business.id}
          sessionId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

function VarianceBadge({ varianceCents }: { varianceCents: number | null }) {
  const { t } = useTranslation();

  if (varianceCents === null) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  if (varianceCents === 0) {
    return <Badge variant="outline">{t("ui.web.cash.balanced")}</Badge>;
  }

  return (
    <Badge variant={varianceCents < 0 ? "destructive" : "secondary"}>
      {money(Math.abs(varianceCents))}{" "}
      {varianceCents < 0 ? t("ui.web.cash.short") : t("ui.web.cash.over")}
    </Badge>
  );
}

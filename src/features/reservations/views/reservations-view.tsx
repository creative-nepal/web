"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
import { tablesQueryOptions } from "@/features/restaurant/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { BookReservationDialog } from "../components/book-reservation-dialog";
import { RESERVATION_STATUS_VARIANTS } from "../constants";
import { reservationQueryKeys, reservationsQueryOptions } from "../queries";
import { reservationAction } from "../services";
import type { Reservation } from "../types";

type PendingAction = { reservation: Reservation; action: "no-show" | "cancel" };

export function ReservationsView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const { data, isFetching } = useQuery(
    reservationsQueryOptions(business?.id ?? "", {
      limit: 50,
      sortBy: "reservedFor",
      sortDirection: "asc",
    }),
  );
  const { data: tables } = useQuery(tablesQueryOptions(business?.id ?? ""));

  const act = useMutation({
    mutationFn: ({
      reservationId,
      action,
    }: {
      reservationId: string;
      action: "seat" | "complete" | "no-show" | "cancel";
    }) => reservationAction(business?.id ?? "", reservationId, action),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: reservationQueryKeys.all,
      });
      toast.success(
        variables.action === "seat"
          ? t("ui.web.reservations.seated")
          : t("ui.web.reservations.closed"),
      );
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (!business) {
    return null;
  }

  const reservations = data?.data ?? [];
  const tableNo = (tableId: string | null) =>
    tables?.find((table) => table.id === tableId)?.tableNo ??
    t("ui.web.reservations.noTable");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.reservations.title")}
        description={t("ui.web.reservations.description")}
        actions={
          <Can permission={{ reservation: ["book"] }}>
            <Button onClick={() => setDialogOpen(true)}>
              {t("ui.web.reservations.book")}
            </Button>
          </Can>
        }
      />

      {!isFetching && reservations.length === 0 ? (
        <EmptyState
          title={t("ui.web.reservations.empty")}
          description={t("ui.web.reservations.emptyHint")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.web.reservations.reservedFor")}</TableHead>
              <TableHead>{t("ui.web.reservations.guestName")}</TableHead>
              <TableHead>{t("ui.web.reservations.partySize")}</TableHead>
              <TableHead>{t("ui.web.reservations.table")}</TableHead>
              <TableHead>{t("ui.field.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="tabular-nums">
                  {new Date(reservation.reservedFor).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  {reservation.guestName}
                  {reservation.guestPhone && (
                    <span className="block text-muted-foreground text-xs">
                      {reservation.guestPhone}
                    </span>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">
                  {reservation.partySize}
                </TableCell>
                <TableCell>{tableNo(reservation.tableId)}</TableCell>
                <TableCell>
                  <StatusBadge
                    value={reservation.status}
                    variants={RESERVATION_STATUS_VARIANTS}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {reservation.status === "booked" && (
                      <Can permission={{ reservation: ["seat"] }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={act.isPending}
                          onClick={() =>
                            act.mutate({
                              reservationId: reservation.id,
                              action: "seat",
                            })
                          }
                        >
                          {t("ui.web.reservations.seat")}
                        </Button>
                      </Can>
                    )}
                    {reservation.status === "seated" && (
                      <Can permission={{ reservation: ["seat"] }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={act.isPending}
                          onClick={() =>
                            act.mutate({
                              reservationId: reservation.id,
                              action: "complete",
                            })
                          }
                        >
                          {t("ui.web.reservations.complete")}
                        </Button>
                      </Can>
                    )}
                    {reservation.status === "booked" && (
                      <Can permission={{ reservation: ["cancel"] }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setPending({ reservation, action: "no-show" })
                          }
                        >
                          {t("ui.web.reservations.noShow")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setPending({ reservation, action: "cancel" })
                          }
                        >
                          {t("ui.web.reservations.cancel")}
                        </Button>
                      </Can>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <BookReservationDialog
        businessId={business.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.action === "cancel"
            ? t("ui.web.reservations.cancel")
            : t("ui.web.reservations.noShow")
        }
        description={
          pending?.action === "cancel"
            ? t("ui.web.reservations.cancelConfirm")
            : t("ui.web.reservations.noShowConfirm")
        }
        variant="destructive"
        onConfirm={() => {
          if (pending) {
            act.mutate({
              reservationId: pending.reservation.id,
              action: pending.action,
            });
            setPending(null);
          }
        }}
      />
    </div>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
import { serviceQueryKeys } from "@/features/services/queries";
import { appointmentQueryKeys, appointmentsQueryOptions } from "../queries";
import { setAppointmentStatus } from "../services";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "../types";

const OPEN_STATUS: AppointmentStatus = "booked";

export function AppointmentsView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const business = useCurrentBusiness();
  const [status, setStatus] = useState<string>("");

  const { data, isFetching } = useQuery(
    appointmentsQueryOptions(business?.id ?? "", status),
  );

  const update = useMutation({
    mutationFn: ({
      appointmentId,
      next,
    }: {
      appointmentId: string;
      next: AppointmentStatus;
    }) => setAppointmentStatus(business?.id ?? "", appointmentId, next),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: appointmentQueryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all });
      toast.success(t("ui.web.appointments.updated"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  if (!business) {
    return null;
  }

  const rows = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.appointments.title")}
        description={t("ui.web.appointments.description")}
      />

      <NativeSelect
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="max-w-56"
        aria-label={t("ui.field.status")}
      >
        <NativeSelectOption value="">
          {t("ui.web.appointments.allStatuses")}
        </NativeSelectOption>
        {APPOINTMENT_STATUSES.map((value) => (
          <NativeSelectOption key={value} value={value}>
            {t(`common.appointmentStatus.${value}`)}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      {!isFetching && rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.appointments.emptyTitle")}
          description={t("ui.web.appointments.emptyBody")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.when")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.services.duration")}
              </TableHead>
              <TableHead>{t("ui.field.status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">
                  {appointment.scheduledAt.slice(0, 16).replace("T", " ")}
                  {appointment.note && (
                    <span className="block text-muted-foreground text-xs">
                      {appointment.note}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {t("ui.web.services.minutes", {
                    count: String(appointment.durationMinutes),
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.status === "completed" ? "default" : "outline"
                    }
                  >
                    {t(`common.appointmentStatus.${appointment.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {appointment.status === OPEN_STATUS && (
                    <Can permission={{ appointment: ["complete"] }}>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={update.isPending}
                          onClick={() =>
                            update.mutate({
                              appointmentId: appointment.id,
                              next: "completed",
                            })
                          }
                        >
                          {t("ui.web.appointments.complete")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={update.isPending}
                          onClick={() =>
                            update.mutate({
                              appointmentId: appointment.id,
                              next: "no_show",
                            })
                          }
                        >
                          {t("common.appointmentStatus.no_show")}
                        </Button>
                      </div>
                    </Can>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { membersQueryOptions } from "@/features/staff/queries";
import { availabilityQueryKeys, availabilityQueryOptions } from "../queries";
import { setAvailability } from "../services";

interface Draft {
  dayOfWeek: number;
  from: string;
  to: string;
}

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function toClock(minute: number): string {
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function AvailabilityView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const business = useCurrentBusiness();

  const { data: members } = useQuery(
    membersQueryOptions(business?.organizationId ?? ""),
  );

  const [staffUserId, setStaffUserId] = useState("");
  const [draft, setDraft] = useState<Draft[]>([]);

  const { data: windows } = useQuery(
    availabilityQueryOptions(business?.id ?? "", staffUserId),
  );

  useEffect(() => {
    if (!staffUserId && members?.length) {
      setStaffUserId(members[0].userId);
    }
  }, [members, staffUserId]);

  useEffect(() => {
    if (windows) {
      setDraft(
        windows.map((window) => ({
          dayOfWeek: window.dayOfWeek,
          from: toClock(window.startMinute),
          to: toClock(window.endMinute),
        })),
      );
    }
  }, [windows]);

  const save = useMutation({
    mutationFn: () =>
      setAvailability(
        business?.id ?? "",
        staffUserId,
        draft.map((entry) => ({
          dayOfWeek: entry.dayOfWeek,
          startMinute: toMinutes(entry.from),
          endMinute: toMinutes(entry.to),
        })),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: availabilityQueryKeys.all,
      });
      toast.success(t("ui.web.appointments.availabilitySaved"));
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.appointments.availability")}
        description={t("ui.web.appointments.workingHours")}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="staff">{t("ui.web.staff.member")}</Label>
        <NativeSelect
          id="staff"
          value={staffUserId}
          onChange={(event) => setStaffUserId(event.target.value)}
          className="max-w-sm"
        >
          {(members ?? []).map((member) => (
            <NativeSelectOption key={member.userId} value={member.userId}>
              {member.email}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {draft.length === 0 ? (
        <EmptyState title={t("ui.web.appointments.noHours")} />
      ) : (
        <div className="flex flex-col gap-2">
          {draft.map((entry, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: draft rows have no stable id
              key={index}
              className="flex items-end gap-2"
            >
              <div className="flex flex-col gap-1">
                <Label className="text-xs">{t("ui.field.when")}</Label>
                <NativeSelect
                  value={String(entry.dayOfWeek)}
                  onChange={(event) =>
                    setDraft((current) =>
                      current.map((row, at) =>
                        at === index
                          ? { ...row, dayOfWeek: Number(event.target.value) }
                          : row,
                      ),
                    )
                  }
                >
                  {DAY_KEYS.map((key, day) => (
                    <NativeSelectOption key={key} value={String(day)}>
                      {t(`common.day.${key}`)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">
                  {t("ui.web.appointments.from")}
                </Label>
                <Input
                  type="time"
                  value={entry.from}
                  onChange={(event) =>
                    setDraft((current) =>
                      current.map((row, at) =>
                        at === index
                          ? { ...row, from: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">{t("ui.web.appointments.to")}</Label>
                <Input
                  type="time"
                  value={entry.to}
                  onChange={(event) =>
                    setDraft((current) =>
                      current.map((row, at) =>
                        at === index ? { ...row, to: event.target.value } : row,
                      ),
                    )
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDraft((current) => current.filter((_, at) => at !== index))
                }
              >
                {t("ui.action.cancel")}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() =>
            setDraft((current) => [
              ...current,
              { dayOfWeek: 1, from: "09:00", to: "17:00" },
            ])
          }
        >
          {t("ui.web.appointments.addWindow")}
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {t("ui.web.appointments.saveAvailability")}
        </Button>
      </div>
    </div>
  );
}

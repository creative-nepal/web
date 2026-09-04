"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { branchesQueryOptions } from "@/features/branches/queries";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { calendarQueryKeys } from "../queries";
import { createEvent } from "../services";
import {
  CALENDAR_KINDS,
  CALENDAR_SCOPES,
  RECURRENCE_FREQUENCIES,
  type RecurrenceFrequency,
} from "../types";

const REMINDERS = [0, 15, 60, 240, 1440] as const;

export function EventDialog({
  businessId,
  open,
  onOpenChange,
}: {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const { data: branches } = useQuery(branchesQueryOptions(businessId));

  const [scope, setScope] = useState<string>("organisation");
  const [kind, setKind] = useState<string>("event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [branchId, setBranchId] = useState("");
  const [freq, setFreq] = useState<string>("none");
  const [remind, setRemind] = useState<string>("0");

  const save = useMutation({
    mutationFn: () =>
      createEvent(businessId, {
        scope,
        kind,
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
        ...(description ? { description } : {}),
        ...(scope === "branch" && branchId ? { branchId } : {}),
        ...(freq !== "none"
          ? {
              recurrence: {
                freq: freq as RecurrenceFrequency,
                interval: 1,
              },
            }
          : {}),
        ...(remind !== "0" ? { remindMinutesBefore: Number(remind) } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: calendarQueryKeys.all });
      toast.success(t("ui.web.calendar.created"));
      setTitle("");
      setDescription("");
      setStartsAt("");
      onOpenChange(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ui.web.calendar.addTitle")}</DialogTitle>
          <DialogDescription>
            {t("ui.web.calendar.scopeHint")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="scope">{t("ui.web.calendar.scope")}</Label>
              <Select
                value={scope}
                onValueChange={(value) => setScope(value ?? "organisation")}
              >
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_SCOPES.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {t(`ui.web.calendar.${entry}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="kind">{t("ui.web.calendar.kind")}</Label>
              <Select
                value={kind}
                onValueChange={(value) => setKind(value ?? "event")}
              >
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_KINDS.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {t(`ui.web.calendar.${entry}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {scope === "branch" && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="branch">{t("ui.web.calendar.branchField")}</Label>
              <Select
                value={branchId}
                onValueChange={(value) => setBranchId(value ?? "")}
              >
                <SelectTrigger id="branch">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(branches?.data ?? []).map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="title">{t("ui.web.calendar.titleField")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="startsAt">{t("ui.web.calendar.startsAt")}</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="freq">{t("ui.web.calendar.repeats")}</Label>
              <Select
                value={freq}
                onValueChange={(value) => setFreq(value ?? "none")}
              >
                <SelectTrigger id="freq">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("ui.web.calendar.never")}
                  </SelectItem>
                  {RECURRENCE_FREQUENCIES.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {t(`ui.web.calendar.${entry}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="remind">
                {t("ui.web.calendar.remindBefore")}
              </Label>
              <Select
                value={remind}
                onValueChange={(value) => setRemind(value ?? "0")}
              >
                <SelectTrigger id="remind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDERS.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {minutes === 0
                        ? t("ui.web.calendar.noReminder")
                        : minutes < 60
                          ? t("ui.web.calendar.minutes", { count: minutes })
                          : minutes < 1440
                            ? t("ui.web.calendar.hours", {
                                count: minutes / 60,
                              })
                            : t("ui.web.calendar.dayBefore")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="description">
              {t("ui.web.calendar.descriptionField")}
            </Label>
            <Textarea
              id="description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={
              !title.trim() ||
              !startsAt ||
              (scope === "branch" && !branchId) ||
              save.isPending
            }
            onClick={() => save.mutate()}
          >
            {t("ui.web.calendar.add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

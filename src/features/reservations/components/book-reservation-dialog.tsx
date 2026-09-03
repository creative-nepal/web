"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { tablesQueryOptions } from "@/features/restaurant/queries";
import { apiErrorMessage } from "@/lib/api-error";
import { DEFAULT_DURATION_MINUTES } from "../constants";
import { reservationQueryKeys } from "../queries";
import { createReservation } from "../services";

const NO_TABLE = "none";

export function BookReservationDialog({
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
  const { data: tables } = useQuery(tablesQueryOptions(businessId));

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [reservedFor, setReservedFor] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(
    DEFAULT_DURATION_MINUTES,
  );
  const [tableId, setTableId] = useState(NO_TABLE);
  const [note, setNote] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      createReservation(businessId, {
        guestName,
        partySize,
        reservedFor: new Date(reservedFor).toISOString(),
        durationMinutes,
        ...(guestPhone ? { guestPhone } : {}),
        ...(tableId === NO_TABLE ? {} : { tableId }),
        ...(note ? { note } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: reservationQueryKeys.all,
      });
      toast.success(t("ui.web.reservations.booked"));
      setGuestName("");
      setGuestPhone("");
      setReservedFor("");
      setTableId(NO_TABLE);
      setNote("");
      onOpenChange(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ui.web.reservations.bookTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="guestName">
              {t("ui.web.reservations.guestName")}
            </Label>
            <Input
              id="guestName"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="guestPhone">
                {t("ui.web.reservations.guestPhone")}
              </Label>
              <Input
                id="guestPhone"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="partySize">
                {t("ui.web.reservations.partySize")}
              </Label>
              <Input
                id="partySize"
                type="number"
                min={1}
                value={partySize}
                onChange={(event) => setPartySize(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="reservedFor">
                {t("ui.web.reservations.reservedFor")}
              </Label>
              <Input
                id="reservedFor"
                type="datetime-local"
                value={reservedFor}
                onChange={(event) => setReservedFor(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="durationMinutes">
                {t("ui.web.reservations.durationMinutes")}
              </Label>
              <Input
                id="durationMinutes"
                type="number"
                min={15}
                step={15}
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(Number(event.target.value))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="tableId">{t("ui.web.reservations.table")}</Label>
            <Select
              value={tableId}
              onValueChange={(value) => setTableId(value ?? NO_TABLE)}
            >
              <SelectTrigger id="tableId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TABLE}>
                  {t("ui.web.reservations.noTable")}
                </SelectItem>
                {(tables ?? []).map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.tableNo} · {table.seats}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="note">{t("ui.web.reservations.note")}</Label>
            <Textarea
              id="note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!guestName.trim() || !reservedFor || submit.isPending}
            onClick={() => submit.mutate()}
          >
            {t("ui.web.reservations.book")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

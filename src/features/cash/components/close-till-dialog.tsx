"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { money, parseAmountToCents, parseCountInput } from "@/lib/money";
import { cashQueryKeys } from "../queries";
import { closeSession } from "../services";
import {
  type CashSessionSummary,
  type DenominationCount,
  NPR_DENOMINATIONS,
} from "../types";

const LARGE_VARIANCE_CENTS = 50_000;

type Mode = "denomination" | "total";

export function CloseTillDialog({
  businessId,
  summary,
  open,
  onOpenChange,
}: {
  businessId: string;
  summary: CashSessionSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("denomination");
  const [counted, setCounted] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [revealed, setRevealed] = useState(false);

  const denominations = useMemo<DenominationCount | null>(() => {
    const entries = NPR_DENOMINATIONS.map((face) => {
      const count = parseCountInput(notes[String(face)] ?? "");
      return count === null ? null : ([String(face), count] as const);
    });

    return entries.some((entry) => entry === null)
      ? null
      : Object.fromEntries(entries as (readonly [string, number])[]);
  }, [notes]);

  const countedCents = useMemo(() => {
    if (mode === "total") {
      return counted.trim() === "" ? null : parseAmountToCents(counted);
    }

    if (!denominations) {
      return null;
    }

    return NPR_DENOMINATIONS.reduce(
      (total, face) => total + face * 100 * (denominations[String(face)] ?? 0),
      0,
    );
  }, [mode, counted, denominations]);

  const hasCount =
    mode === "total"
      ? counted.trim() !== ""
      : Object.values(notes).some((value) => value.trim() !== "");

  const variance =
    countedCents === null ? null : countedCents - summary.expectedCashCents;

  const largeVariance =
    variance !== null && Math.abs(variance) >= LARGE_VARIANCE_CENTS;

  const showExpected = revealed || hasCount;

  const close = useMutation({
    mutationFn: () =>
      closeSession(businessId, summary.session.id, {
        ...(mode === "denomination" && denominations
          ? { denominations }
          : { countedCashCents: countedCents ?? 0 }),
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cashQueryKeys.all });
      setCounted("");
      setNotes({});
      setNote("");
      setRevealed(false);
      onOpenChange(false);
      toast.success(t("ui.web.cash.closed"));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t("ui.error.generic"))),
  });

  const blocked =
    countedCents === null || (largeVariance && !note.trim()) || close.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("ui.web.cash.closeTitle")}</DialogTitle>
          <DialogDescription>
            {t("ui.web.cash.blindCountHint")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex gap-1">
            {(["denomination", "total"] as const).map((entry) => (
              <Button
                key={entry}
                size="sm"
                variant={mode === entry ? "default" : "outline"}
                onClick={() => setMode(entry)}
              >
                {entry === "denomination"
                  ? t("ui.web.cash.byDenomination")
                  : t("ui.web.cash.byTotal")}
              </Button>
            ))}
          </div>

          {mode === "denomination" ? (
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-[1fr_6rem_auto] items-center gap-2 text-muted-foreground text-xs">
                <span>{t("ui.web.cash.denomination")}</span>
                <span>{t("ui.web.cash.noteCount")}</span>
                <span className="text-right">{t("ui.field.amount")}</span>
              </div>
              {NPR_DENOMINATIONS.map((face) => {
                const raw = notes[String(face)] ?? "";
                const count = parseCountInput(raw);

                return (
                  <div
                    key={face}
                    className="grid grid-cols-[1fr_6rem_auto] items-center gap-2"
                  >
                    <Label htmlFor={`note-${face}`} className="tabular-nums">
                      {money(face * 100)}
                    </Label>
                    <Input
                      id={`note-${face}`}
                      inputMode="numeric"
                      value={raw}
                      aria-invalid={count === null}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [String(face)]: event.target.value,
                        }))
                      }
                    />
                    <span className="text-right text-muted-foreground text-sm tabular-nums">
                      {money(face * 100 * (count ?? 0))}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">
                  {t("ui.web.cash.denominationTotal")}
                </span>
                <span className="font-medium tabular-nums">
                  {countedCents === null ? "—" : money(countedCents)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Label htmlFor="counted">{t("ui.web.cash.counted")}</Label>
              <Input
                id="counted"
                inputMode="decimal"
                value={counted}
                aria-invalid={counted.trim() !== "" && countedCents === null}
                onChange={(event) => setCounted(event.target.value)}
              />
              {counted.trim() !== "" && countedCents === null && (
                <p className="text-destructive text-xs">
                  {t("ui.web.cash.countInvalid")}
                </p>
              )}
            </div>
          )}

          {showExpected ? (
            <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("ui.web.cash.expected")}
                </span>
                <span className="tabular-nums">
                  {money(summary.expectedCashCents)}
                </span>
              </div>
              {variance !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("ui.web.cash.variance")}
                  </span>
                  <span
                    className={
                      variance === 0
                        ? "font-medium tabular-nums"
                        : "font-medium text-destructive tabular-nums"
                    }
                  >
                    {variance === 0
                      ? t("ui.web.cash.balanced")
                      : `${money(Math.abs(variance))} ${
                          variance < 0
                            ? t("ui.web.cash.short")
                            : t("ui.web.cash.over")
                        }`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => setRevealed(true)}
            >
              {t("ui.web.cash.revealExpected")}
            </Button>
          )}

          {largeVariance && (
            <p className="text-destructive text-sm">
              {t("ui.web.cash.varianceLarge")}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="closeNote">{t("ui.web.cash.reason")}</Label>
            <Textarea
              id="closeNote"
              rows={2}
              value={note}
              aria-invalid={largeVariance && !note.trim()}
              onChange={(event) => setNote(event.target.value)}
            />
            {largeVariance && !note.trim() && (
              <p className="text-destructive text-xs">
                {t("ui.web.cash.varianceReasonRequired")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button disabled={blocked} onClick={() => close.mutate()}>
            {t("ui.web.cash.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

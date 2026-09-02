"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import { purchasingQueryKeys } from "../queries";
import { issueDebitNote } from "../services";
import { DEBIT_NOTE_REASONS, type DebitNoteReason } from "../types";

interface DraftLine {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
}

const EMPTY_LINE: DraftLine = {
  productId: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  vat: 0,
};

export function DebitNoteDialog({
  businessId,
  billId,
  billNumber,
  onClose,
}: {
  businessId: string;
  billId: string;
  billNumber: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [reason, setReason] = useState<DebitNoteReason>("return");
  const [note, setNote] = useState("");
  const [restock, setRestock] = useState(false);
  const [lines, setLines] = useState<DraftLine[]>([{ ...EMPTY_LINE }]);

  const totalCents = lines.reduce(
    (sum, line) =>
      sum + Math.round(line.unitPrice * 100 * line.quantity) + line.vat * 100,
    0,
  );

  const issue = useMutation({
    mutationFn: () =>
      issueDebitNote(businessId, billId, {
        reason,
        note: note.trim() || undefined,
        restock,
        items: lines.map((line) => ({
          productId: line.productId.trim() || undefined,
          description: line.description.trim(),
          quantity: line.quantity,
          unitPriceCents: Math.round(line.unitPrice * 100),
          vatCents: Math.round(line.vat * 100),
        })),
      }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: purchasingQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        `${t("ui.web.purchasing.debitNoteIssued")} — ${created.series}-${created.noteNumber}`,
      );
      onClose();
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((current) =>
      current.map((line, at) => (at === index ? { ...line, ...patch } : line)),
    );
  }

  const canSubmit =
    lines.length > 0 &&
    lines.every((line) => line.description.trim() && line.unitPrice > 0) &&
    (!restock || lines.every((line) => line.productId.trim()));

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`${t("ui.web.purchasing.issueDebitNote")} — ${billNumber}`}
      description={t("ui.web.purchasing.debitNoteHint")}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="debit-note-reason">{t("ui.field.reason")}</Label>
          <NativeSelect
            id="debit-note-reason"
            value={reason}
            onChange={(event) =>
              setReason(event.target.value as DebitNoteReason)
            }
          >
            {DEBIT_NOTE_REASONS.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {t(`common.debitNoteReason.${value}`)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="debit-note-note">
            {t("ui.web.purchasing.lineDescription")}
          </Label>
          <Input
            id="debit-note-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3">
          {lines.map((line, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: draft rows have no stable id
              key={index}
              className="flex flex-col gap-2 rounded-none border p-3"
            >
              <div className="flex gap-2">
                <Input
                  placeholder={t("ui.web.purchasing.lineDescription")}
                  value={line.description}
                  onChange={(event) =>
                    updateLine(index, { description: event.target.value })
                  }
                />
                {lines.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLines((current) =>
                        current.filter((_, at) => at !== index),
                      )
                    }
                  >
                    {t("ui.web.purchasing.removeLine")}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">{t("ui.field.quantity")}</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.001"
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(index, {
                        quantity: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {t("ui.web.purchasing.unitPrice")}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(event) =>
                      updateLine(index, {
                        unitPrice: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">
                    {t("ui.web.purchasing.vat")}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.vat}
                    onChange={(event) =>
                      updateLine(index, { vat: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">{t("ui.field.product")}</Label>
                  <Input
                    value={line.productId}
                    onChange={(event) =>
                      updateLine(index, { productId: event.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setLines((current) => [...current, { ...EMPTY_LINE }])
            }
          >
            {t("ui.web.purchasing.addLine")}
          </Button>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="debit-note-restock"
            checked={restock}
            onCheckedChange={(checked) => setRestock(checked === true)}
          />
          <div className="flex flex-col">
            <Label htmlFor="debit-note-restock">
              {t("ui.web.purchasing.restock")}
            </Label>
            <span className="text-muted-foreground text-xs">
              {t("ui.web.purchasing.restockHint")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-muted-foreground text-sm">
            {t("ui.field.total")}
          </span>
          <span className="font-medium tabular-nums">{money(totalCents)}</span>
        </div>

        <Button
          onClick={() => issue.mutate()}
          disabled={issue.isPending || !canSubmit}
        >
          {t("ui.web.purchasing.issueDebitNote")}
        </Button>
      </div>
    </ContentDialog>
  );
}

"use client";

import type * as React from "react";
import { SummaryList } from "@/components/summary-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import {
  isPacked,
  lineTotalCents,
  unitLabel,
} from "@/features/products/pack-pricing";
import { money } from "@/lib/money";
import type { CartLine } from "../types";

interface CartPanelProps {
  lines: CartLine[];
  totals: {
    subtotalCents: number;
    discountCents: number;
    serviceChargeCents: number;
    vatCents: number;
    totalCents: number;
  };
  vatRegistered: boolean;
  discountPercent: number;
  maxDiscountPercent: number;
  onDiscountPercentChange: (percent: number) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onNoteChange: (productId: string, note: string) => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  children?: React.ReactNode;
}

export function CartPanel({
  lines,
  totals,
  vatRegistered,
  discountPercent,
  maxDiscountPercent,
  onDiscountPercentChange,
  onQuantityChange,
  onNoteChange,
  canSubmit,
  isSubmitting,
  onSubmit,
  children,
}: CartPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="h-fit">
      <CardContent className="flex flex-col gap-4">
        {lines.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.pos.cartEmpty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map((line) => (
              <div key={line.product.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex flex-1 flex-col truncate">
                    <span className="truncate">{line.product.name}</span>
                    {isPacked(line.product) && (
                      <span className="text-muted-foreground text-xs">
                        {unitLabel(line.product)} ·{" "}
                        {money(line.product.subUnitPriceCents)}
                      </span>
                    )}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={line.quantity}
                    onChange={(event) =>
                      onQuantityChange(
                        line.product.id,
                        Number(event.target.value),
                      )
                    }
                    className="h-8 w-16"
                  />
                  <span className="w-20 text-right tabular-nums">
                    {money(lineTotalCents(line.product, line.quantity))}
                  </span>
                </div>
                <Input
                  value={line.note ?? ""}
                  onChange={(event) =>
                    onNoteChange(line.product.id, event.target.value)
                  }
                  placeholder={t("ui.web.pos.notePlaceholder")}
                  maxLength={200}
                  className="h-7 text-xs"
                />
              </div>
            ))}
          </div>
        )}

        <Separator />

        {maxDiscountPercent > 0 && lines.length > 0 && (
          <Can permission={{ order: ["discount"] }}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pos-discount">
                {t("ui.web.pos.discountPercent")}
              </Label>
              <Input
                id="pos-discount"
                type="number"
                min={0}
                max={maxDiscountPercent}
                step={0.5}
                value={discountPercent}
                onChange={(event) =>
                  onDiscountPercentChange(Number(event.target.value))
                }
                className="h-8"
              />
              <p className="text-muted-foreground text-xs">
                {t("ui.web.pos.discountHint", { max: maxDiscountPercent })}
              </p>
            </div>
          </Can>
        )}

        <SummaryList
          rows={[
            {
              label: t("common.invoice.subtotal"),
              value: money(totals.subtotalCents),
            },
            ...(totals.discountCents > 0
              ? [
                  {
                    label: t("ui.web.pos.discount"),
                    value: `- ${money(totals.discountCents)}`,
                  },
                ]
              : []),
            ...(totals.serviceChargeCents > 0
              ? [
                  {
                    label: t("ui.web.pos.serviceCharge"),
                    value: money(totals.serviceChargeCents),
                  },
                ]
              : []),
            ...(vatRegistered
              ? [
                  {
                    label: t("ui.web.pos.vat", { rate: 13 }),
                    value: money(totals.vatCents),
                  },
                ]
              : []),
            {
              label: t("common.invoice.total"),
              value: money(totals.totalCents),
              emphasis: true,
            },
          ]}
        />

        {children}

        <Button size="lg" disabled={!canSubmit} onClick={onSubmit}>
          {isSubmitting
            ? t("ui.web.pos.processing")
            : t("ui.web.pos.completeSale")}
        </Button>
      </CardContent>
    </Card>
  );
}

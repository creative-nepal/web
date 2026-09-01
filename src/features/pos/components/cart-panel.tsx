"use client";

import type * as React from "react";
import { SummaryList } from "@/components/summary-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import type { CartLine } from "../types";

interface CartPanelProps {
  lines: CartLine[];
  totals: {
    subtotalCents: number;
    serviceChargeCents: number;
    vatCents: number;
    totalCents: number;
  };
  vatRegistered: boolean;
  onQuantityChange: (productId: string, quantity: number) => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  children?: React.ReactNode;
}

export function CartPanel({
  lines,
  totals,
  vatRegistered,
  onQuantityChange,
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
              <div
                key={line.product.id}
                className="flex items-center gap-2 text-sm"
              >
                <span className="flex-1 truncate">{line.product.name}</span>
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
                  {money(line.product.priceCents * line.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <SummaryList
          rows={[
            {
              label: t("common.invoice.subtotal"),
              value: money(totals.subtotalCents),
            },
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
          {isSubmitting ? "Processing..." : "Complete sale"}
        </Button>
      </CardContent>
    </Card>
  );
}

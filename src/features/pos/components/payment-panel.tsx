"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PAYMENT_METHODS, type PaymentMethod } from "@/features/cash/types";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";

const COUNTER_METHODS: PaymentMethod[] = [
  "cash",
  "esewa",
  "khalti",
  "fonepay",
  "card",
];

export function PaymentPanel({
  totalCents,
  method,
  onMethodChange,
  reference,
  onReferenceChange,
  tillOpen,
}: {
  totalCents: number;
  method: PaymentMethod | null;
  onMethodChange: (method: PaymentMethod | null) => void;
  reference: string;
  onReferenceChange: (reference: string) => void;
  tillOpen: boolean;
}) {
  const { t } = useTranslation();

  const needsReference = method !== null && method !== "cash";

  return (
    <div className="flex flex-col gap-2">
      <Label>{t("ui.web.cash.payment")}</Label>
      <ToggleGroup
        variant="outline"
        size="sm"
        multiple={false}
        value={method ? [method] : []}
        onValueChange={(value) =>
          onMethodChange((value[0] as PaymentMethod | undefined) ?? null)
        }
        className="flex-wrap"
      >
        {PAYMENT_METHODS.filter((entry) => COUNTER_METHODS.includes(entry)).map(
          (entry) => (
            <ToggleGroupItem
              key={entry}
              value={entry}
              disabled={entry === "cash" && !tillOpen}
            >
              {t(`common.paymentMethod.${entry}`)}
            </ToggleGroupItem>
          ),
        )}
      </ToggleGroup>

      {needsReference && (
        <Input
          value={reference}
          onChange={(event) => onReferenceChange(event.target.value)}
          placeholder={t("ui.web.cash.reference")}
          className="h-8"
        />
      )}

      {method === "cash" && !tillOpen && (
        <p className="text-destructive text-xs">
          {t("ui.web.cash.noSessionHint")}
        </p>
      )}

      {method && (
        <p className="text-muted-foreground text-xs">
          {t(`common.paymentMethod.${method}`)} · {money(totalCents)}
        </p>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { parseAmountToCents } from "@/lib/money";

export function OpenTillCard({
  float,
  isPending,
  onFloatChange,
  onOpen,
}: {
  float: string;
  isPending: boolean;
  onFloatChange: (value: string) => void;
  onOpen: () => void;
}) {
  const { t } = useTranslation();

  const invalid = float.trim() !== "" && parseAmountToCents(float) === null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ui.web.cash.openTitle")}</CardTitle>
        <CardDescription>{t("ui.web.cash.openingFloatHint")}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="float">{t("ui.web.cash.openingFloat")}</Label>
          <Input
            id="float"
            inputMode="decimal"
            value={float}
            aria-invalid={invalid}
            onChange={(event) => onFloatChange(event.target.value)}
            className="max-w-40"
          />
          {invalid && (
            <p className="text-destructive text-xs">
              {t("ui.web.cash.openingFloatInvalid")}
            </p>
          )}
        </div>
        <Button
          disabled={float.trim() === "" || invalid || isPending}
          onClick={onOpen}
        >
          {t("ui.web.cash.open")}
        </Button>
      </CardContent>
    </Card>
  );
}

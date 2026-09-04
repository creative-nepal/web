"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export const PERIOD_PRESETS = [7, 30, 90] as const;

export function startOfDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function PeriodPicker({
  days,
  onChange,
}: {
  days: number;
  onChange: (days: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-1">
      {PERIOD_PRESETS.map((preset) => (
        <Button
          key={preset}
          size="sm"
          variant={days === preset ? "default" : "outline"}
          onClick={() => onChange(preset)}
        >
          {t("ui.web.reports.lastDays", { days: preset })}
        </Button>
      ))}
    </div>
  );
}

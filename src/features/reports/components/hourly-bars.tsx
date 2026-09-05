"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function HourlyBars({
  hours,
}: {
  hours: Array<{ hour: number; invoices: number; netCents: number }>;
}) {
  const { t } = useTranslation();
  const peak = Math.max(1, ...hours.map((row) => row.netCents));

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-1">
        <span className="font-medium text-sm">
          {t("ui.web.reports.byHour")}
        </span>
        {hours.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.reports.noSales")}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {hours.map((row) => (
              <div key={row.hour} className="flex items-center gap-2">
                <span className="w-12 font-mono text-muted-foreground text-xs tabular-nums">
                  {hourLabel(row.hour)}
                </span>
                <div className="h-4 flex-1 rounded-sm bg-muted">
                  <div
                    className="h-4 rounded-sm bg-primary"
                    style={{
                      width: `${Math.round((row.netCents / peak) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-24 text-right font-mono text-xs tabular-nums">
                  {money(row.netCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

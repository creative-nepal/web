"use client";

import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { toDevanagari } from "@/lib/formatters/nepali-date";
import type { CalendarEntry } from "../types";
import { ScopeBadges } from "./scope-badges";

export function DayPanel({
  selectedDay,
  entries,
  language,
}: {
  selectedDay: string | null;
  entries: CalendarEntry[];
  language: string;
}) {
  const { t } = useTranslation();

  if (!selectedDay) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          {t("ui.web.calendar.noPanchang")}
        </p>
      </div>
    );
  }

  const heading =
    language === "ne"
      ? (entries[0]?.date.bsNepali ?? toDevanagari(selectedDay))
      : (entries[0]?.date.bsLong ?? selectedDay);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <span className="font-medium text-sm">{heading}</span>
      <span className="font-mono text-muted-foreground text-xs tabular-nums">
        {selectedDay}
      </span>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("ui.web.calendar.empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-1 rounded-lg border p-2"
            >
              <span className="text-sm">{entry.title}</span>
              <ScopeBadges entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

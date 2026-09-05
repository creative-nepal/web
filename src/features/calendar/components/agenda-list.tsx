"use client";

import type { CalendarEntry } from "../types";
import { ScopeBadges } from "./scope-badges";

export function AgendaList({
  days,
  language,
}: {
  days: [string, CalendarEntry[]][];
  language: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {days.map(([day, entries]) => {
        const date = entries[0].date;

        return (
          <div key={day} className="flex gap-4">
            <div className="flex w-40 shrink-0 flex-col pt-1">
              <span className="font-medium text-sm">
                {language === "ne" ? date.bsNepali : date.bsLong}
              </span>
              <span className="font-mono text-muted-foreground text-xs tabular-nums">
                {new Date(`${date.ad}T00:00:00Z`).toLocaleDateString(
                  undefined,
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  },
                )}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="w-14 shrink-0 font-mono text-muted-foreground text-xs tabular-nums">
                    {entry.allDay
                      ? "—"
                      : new Date(entry.startsAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </span>
                  <span className="flex-1 truncate text-sm">{entry.title}</span>
                  <ScopeBadges entry={entry} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

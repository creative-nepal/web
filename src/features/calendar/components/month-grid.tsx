"use client";

import {
  BS_WEEKDAYS_EN,
  BS_WEEKDAYS_NE,
  type GridCell,
  toDevanagari,
} from "@/lib/formatters/nepali-date";
import { cn } from "@/lib/utils";
import type { CalendarEntry } from "../types";

export function MonthGrid({
  weeks,
  entriesByDay,
  language,
  onSelectDay,
  selectedDay,
}: {
  weeks: GridCell[][];
  entriesByDay: Map<string, CalendarEntry[]>;
  language: string;
  onSelectDay: (ad: string) => void;
  selectedDay: string | null;
}) {
  const weekdays = language === "ne" ? BS_WEEKDAYS_NE : BS_WEEKDAYS_EN;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[52rem]">
        <div className="grid grid-cols-7">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={cn(
                "pb-3 text-center font-semibold text-sm",
                index === 0 || index === 6
                  ? "text-destructive"
                  : "text-foreground",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {weeks.flat().map((cell) => {
            const entries = entriesByDay.get(cell.ad) ?? [];
            const holiday =
              entries.some((entry) => entry.kind === "holiday") ||
              cell.isSaturday;

            return (
              <button
                key={`${cell.bsYear}-${cell.bsMonth}-${cell.bsDay}`}
                type="button"
                onClick={() => onSelectDay(cell.ad)}
                className={cn(
                  "flex h-28 flex-col rounded-lg border p-2 text-left transition",
                  cell.isToday
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : cell.inMonth
                      ? "hover:bg-accent"
                      : "bg-muted/30",
                  selectedDay === cell.ad &&
                    !cell.isToday &&
                    "ring-1 ring-primary ring-inset",
                )}
              >
                <div className="flex w-full items-start justify-between gap-1">
                  <span
                    className={cn(
                      "line-clamp-2 flex-1 text-[11px] leading-tight",
                      cell.isToday
                        ? "text-white"
                        : holiday
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {entries[0]?.title ?? ""}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] tabular-nums",
                      cell.isToday
                        ? "text-white"
                        : cell.inMonth
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {cell.adDay}
                  </span>
                </div>

                <span
                  className={cn(
                    "flex-1 pt-1 text-center font-semibold text-2xl leading-none",
                    cell.isToday
                      ? "text-white"
                      : !cell.inMonth
                        ? "text-muted-foreground/40"
                        : holiday
                          ? "text-destructive"
                          : "text-foreground",
                  )}
                >
                  {language === "ne" ? toDevanagari(cell.bsDay) : cell.bsDay}
                </span>

                <span
                  className={cn(
                    "text-center text-[11px] leading-none",
                    cell.isToday ? "text-white/80" : "text-muted-foreground/70",
                  )}
                >
                  {entries.length > 1 ? `+${entries.length - 1}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

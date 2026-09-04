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
      <div className="min-w-[46rem] rounded-lg border">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={cn(
                "px-2 py-2 text-center font-medium text-xs",
                index === 6 && "text-destructive",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div
            key={week.map((cell) => cell.ad || cell.weekday).join("-")}
            className="grid grid-cols-7 border-b last:border-b-0"
          >
            {week.map((cell) => {
              const entries = entriesByDay.get(cell.ad) ?? [];
              const holiday = entries.some((entry) => entry.kind === "holiday");

              return (
                <button
                  key={`${cell.ad}-${cell.weekday}`}
                  type="button"
                  disabled={!cell.inMonth}
                  onClick={() => onSelectDay(cell.ad)}
                  className={cn(
                    "flex min-h-24 flex-col gap-1 border-r p-2 text-left align-top last:border-r-0",
                    cell.inMonth
                      ? "hover:bg-accent"
                      : "bg-muted/20 cursor-default",
                    cell.isToday &&
                      "bg-primary/10 ring-1 ring-primary ring-inset",
                    selectedDay === cell.ad && "bg-accent",
                  )}
                >
                  {cell.inMonth && (
                    <>
                      <div className="flex items-baseline justify-between gap-1">
                        <span
                          className={cn(
                            "font-semibold text-lg leading-none",
                            (cell.isSaturday || holiday) && "text-destructive",
                          )}
                        >
                          {language === "ne"
                            ? toDevanagari(cell.bsDay)
                            : cell.bsDay}
                        </span>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {cell.adDay}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        {entries.slice(0, 3).map((entry) => (
                          <span
                            key={entry.id}
                            className={cn(
                              "truncate rounded px-1 py-0.5 text-[11px] leading-tight",
                              entry.kind === "holiday"
                                ? "bg-destructive/10 text-destructive"
                                : entry.source === "event"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {entry.title}
                          </span>
                        ))}
                        {entries.length > 3 && (
                          <span className="px-1 text-[11px] text-muted-foreground">
                            +{entries.length - 3}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

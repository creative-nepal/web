import type * as React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface SummaryRow {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}

export function SummaryList({ rows }: { rows: SummaryRow[] }) {
  return (
    <dl className="flex flex-col gap-1.5 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          {row.emphasis && <Separator className="my-1.5" />}
          <div
            className={cn(
              "flex items-baseline justify-between gap-4",
              row.emphasis && "text-base",
            )}
          >
            <dt
              className={cn(
                "min-w-0 truncate",
                row.emphasis
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {row.label}
            </dt>
            <dd
              data-slot="amount"
              className={cn(
                "shrink-0 font-mono tabular-nums",
                row.emphasis
                  ? "font-semibold text-foreground text-lg"
                  : "text-foreground",
              )}
            >
              {row.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

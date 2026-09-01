import type * as React from "react";

export interface SummaryRow {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
}

export function SummaryList({ rows }: { rows: SummaryRow[] }) {
  return (
    <dl className="flex flex-col gap-1 text-sm">
      {rows.map((row) => (
        <div
          key={row.label}
          className={
            row.emphasis
              ? "flex justify-between font-semibold text-base"
              : "flex justify-between"
          }
        >
          <dt className={row.emphasis ? "" : "text-muted-foreground"}>
            {row.label}
          </dt>
          <dd className="tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

"use client";

import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  actions: Array<{ label: string; onClick: () => void }>;
  children?: React.ReactNode;
}

export function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  actions,
  children,
}: DateRangeFilterProps) {
  const ready = Boolean(from && to);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input
        type="date"
        value={from}
        onChange={(event) => onFromChange(event.target.value)}
        className="max-w-40"
      />
      <Input
        type="date"
        value={to}
        onChange={(event) => onToChange(event.target.value)}
        className="max-w-40"
      />
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          disabled={!ready}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
      {children}
    </div>
  );
}

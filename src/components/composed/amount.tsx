import type * as React from "react";
import { money } from "@/lib/money";
import { cn } from "@/lib/utils";

type AmountTone = "default" | "muted" | "total" | "signed";

interface AmountProps extends React.ComponentProps<"span"> {
  cents: number;
  tone?: AmountTone;
  showZeroAs?: string;
}

const TONE: Record<AmountTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  total: "font-semibold text-foreground",
  signed: "",
};

function Amount({
  cents,
  tone = "default",
  showZeroAs,
  className,
  ...props
}: AmountProps) {
  if (cents === 0 && showZeroAs !== undefined) {
    return (
      <span
        data-slot="amount"
        className={cn("font-mono text-muted-foreground", className)}
        {...props}
      >
        {showZeroAs}
      </span>
    );
  }

  return (
    <span
      data-slot="amount"
      className={cn(
        "font-mono tabular-nums",
        TONE[tone],
        tone === "signed" && cents < 0 && "text-destructive",
        className,
      )}
      {...props}
    >
      {money(cents)}
    </span>
  );
}

interface QuantityProps extends React.ComponentProps<"span"> {
  value: number;
  unit?: string;
  signed?: boolean;
}

function Quantity({
  value,
  unit,
  signed = false,
  className,
  ...props
}: QuantityProps) {
  return (
    <span
      data-slot="amount"
      className={cn(
        "font-mono tabular-nums",
        signed && value < 0 && "text-destructive",
        className,
      )}
      {...props}
    >
      {signed && value > 0 ? "+" : ""}
      {value}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}

export type { AmountProps, AmountTone, QuantityProps };
export { Amount, Quantity };

import { formatCurrency } from "@/lib/formatters";

export function money(cents: number): string {
  return formatCurrency(cents / 100, "NPR");
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim();

  if (!AMOUNT_PATTERN.test(trimmed)) {
    return null;
  }

  const cents = Math.round(Number(trimmed) * 100);

  return Number.isSafeInteger(cents) ? cents : null;
}

export function parseCountInput(input: string): number | null {
  const trimmed = input.trim();

  if (trimmed === "") {
    return 0;
  }

  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const count = Number(trimmed);

  return Number.isSafeInteger(count) ? count : null;
}

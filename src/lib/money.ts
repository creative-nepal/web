import { formatCurrency } from "@/lib/formatters";

export function money(cents: number): string {
  return formatCurrency(cents / 100, "NPR");
}

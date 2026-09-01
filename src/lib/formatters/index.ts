import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function formatDate(
  date: Date | string,
  formatStr: string = "MMM d, yyyy",
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : "";
}

export function formatDateTime(
  date: Date | string,
  formatStr: string = "MMM d, yyyy HH:mm",
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : "";
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj)
    ? formatDistanceToNow(dateObj, { addSuffix: true })
    : "";
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) {
    return "0 Bytes";
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / 1024 ** i).toFixed(2))} ${sizes[i]}`;
}

export function truncate(text: string, length: number = 50): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

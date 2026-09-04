import { api } from "@/lib/api";
import type { ImportSummary } from "./types";

export type ExportFormat = "csv" | "xlsx";

export async function downloadExport(
  businessId: string,
  resource: string,
  format: ExportFormat,
): Promise<void> {
  const response = await api.get(
    `/api/v1/businesses/${businessId}/${resource}/export`,
    { params: { format }, responseType: "blob" },
  );

  const disposition = String(response.headers["content-disposition"] ?? "");
  const match = disposition.match(/filename="?([^";]+)"?/);

  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = match?.[1] ?? `${resource}.${format}`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importRows<TRow>(
  businessId: string,
  resource: string,
  rows: TRow[],
  dryRun: boolean,
): Promise<ImportSummary> {
  const { data } = await api.post<ImportSummary>(
    `/api/v1/businesses/${businessId}/${resource}/import`,
    { rows, dryRun },
  );
  return data;
}

import { api } from "./api";

export async function downloadFile(
  url: string,
  params: Record<string, string | number | undefined>,
  fallbackName: string,
): Promise<void> {
  const response = await api.get<Blob>(url, {
    params,
    responseType: "blob",
  });

  const disposition = String(response.headers["content-disposition"] ?? "");
  const match = /filename="?([^";]+)"?/.exec(disposition);

  const href = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = match?.[1] ?? fallbackName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

import { api } from "@/lib/api";
import type { FilePurpose, StoredFile, UploadTicket } from "./types";

async function createUpload(
  businessId: string,
  file: File,
  purpose: FilePurpose,
): Promise<UploadTicket> {
  const { data } = await api.post<UploadTicket>(
    `/api/v1/businesses/${businessId}/files`,
    {
      purpose,
      originalName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    },
  );
  return data;
}

async function complete(
  businessId: string,
  fileId: string,
): Promise<StoredFile> {
  const { data } = await api.post<StoredFile>(
    `/api/v1/businesses/${businessId}/files/${fileId}/complete`,
    {},
  );
  return data;
}

/**
 * Three steps, and the bytes never touch the API: it signs, the browser PUTs
 * straight to object storage, then the server confirms what actually landed.
 */
export async function uploadFile(
  businessId: string,
  file: File,
  purpose: FilePurpose,
): Promise<StoredFile> {
  const ticket = await createUpload(businessId, file, purpose);

  const response = await fetch(ticket.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  return complete(businessId, ticket.file.id);
}

export async function getDownloadUrl(
  businessId: string,
  fileId: string,
): Promise<string> {
  const { data } = await api.get<{ url: string }>(
    `/api/v1/businesses/${businessId}/files/${fileId}/download`,
  );
  return data.url;
}

export function publicFileUrl(fileId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${base}/api/v1/public/files/${fileId}`;
}

export async function uploadBusinessFile(
  businessId: string,
  file: File,
  purpose: FilePurpose,
): Promise<{ id: string; url: string }> {
  const stored = await uploadFile(businessId, file, purpose);
  return { id: stored.id, url: publicFileUrl(stored.id) };
}

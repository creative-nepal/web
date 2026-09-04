import { api } from "@/lib/api";
import type {
  DownloadTarget,
  FilePurpose,
  StoredFile,
  UploadTicket,
} from "./types";
import { maxBytesFor } from "./types";

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

export async function uploadFile(
  businessId: string,
  file: File,
  purpose: FilePurpose,
): Promise<StoredFile> {
  const limit = maxBytesFor(file.type);

  if (file.size > limit) {
    throw new Error(
      `${file.name} is ${Math.round(file.size / 1024 / 1024)}MB; the limit is ${Math.round(limit / 1024 / 1024)}MB`,
    );
  }

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
  const { url } = await getDownloadTarget(businessId, fileId);
  return url;
}

export async function getDownloadTarget(
  businessId: string,
  fileId: string,
): Promise<DownloadTarget> {
  const { data } = await api.get<DownloadTarget>(
    `/api/v1/businesses/${businessId}/files/${fileId}/download`,
  );
  return data;
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

export type FilePurpose =
  | "prescription"
  | "business-logo"
  | "product-image"
  | "content-image"
  | "content-video"
  | "attachment";

export type FileVisibility = "private" | "public";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";
export const ATTACHMENT_ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT},application/pdf,text/csv,text/plain`;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export function maxBytesFor(contentType: string): number {
  return contentType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_UPLOAD_BYTES;
}

export interface StoredFile {
  id: string;
  purpose: FilePurpose;
  visibility: FileVisibility;
  storageKey: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  status: "pending" | "ready";
  createdAt: string;
}

export interface UploadTicket {
  file: StoredFile;
  uploadUrl: string;
  expiresInSeconds: number;
}

export interface DownloadTarget {
  url: string;
  /** null when the file is public, so the URL is safe to persist. */
  expiresInSeconds: number | null;
}

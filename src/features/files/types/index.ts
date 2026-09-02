export type FilePurpose =
  | "prescription"
  | "business-logo"
  | "product-image"
  | "content-image"
  | "attachment";

export interface StoredFile {
  id: string;
  purpose: FilePurpose;
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

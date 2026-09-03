"use client";

import {
  RiCloseLine,
  RiErrorWarningLine,
  RiFile3Line,
  RiUpload2Line,
} from "@remixicon/react";
import { useRef, useState } from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";

interface UploadedFile {
  id: string;
  url: string;
  name?: string;
}

interface FileUploadProps {
  /**
   * Performs the upload and resolves the stored file. Transport differs per
   * app — business-scoped in the workspace, platform-scoped in admin — so it
   * is injected rather than assumed here.
   */
  onUpload: (file: File) => Promise<UploadedFile>;
  value?: UploadedFile | null;
  onChange?: (value: UploadedFile | null) => void;
  accept?: string;
  label: string;
  clearLabel: string;
  hint?: string;
  /** Render the stored file as a thumbnail rather than a file icon. */
  image?: boolean;
  disabled?: boolean;
}

function FileUpload({
  onUpload,
  value = null,
  onChange,
  accept = "image/jpeg,image/png,image/webp",
  label,
  clearLabel,
  hint,
  image = true,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setUploading(true);
    setError(null);

    try {
      onChange?.(await onUpload(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setUploading(false);
    }
  }

  const state = uploading
    ? "uploading"
    : error
      ? "error"
      : value
        ? "done"
        : "idle";

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handle(file);
          }
          event.target.value = "";
        }}
      />

      <Attachment state={state} orientation={image ? "vertical" : "horizontal"}>
        <AttachmentMedia variant={image && value ? "image" : "icon"}>
          {uploading ? (
            <Spinner />
          ) : error ? (
            <RiErrorWarningLine />
          ) : value && image ? (
            // biome-ignore lint/performance/noImgElement: a signed, short-lived object-storage URL that next/image cannot cache
            <img src={value.url} alt="" />
          ) : value ? (
            <RiFile3Line />
          ) : (
            <RiUpload2Line />
          )}
        </AttachmentMedia>

        <AttachmentContent>
          <AttachmentTitle>
            {error ? error : (value?.name ?? label)}
          </AttachmentTitle>
          {hint && !error && (
            <AttachmentDescription>{hint}</AttachmentDescription>
          )}
        </AttachmentContent>

        {value && onChange && !uploading && (
          <AttachmentActions>
            <AttachmentAction
              aria-label={clearLabel}
              disabled={disabled}
              onClick={() => {
                setError(null);
                onChange(null);
              }}
            >
              <RiCloseLine />
            </AttachmentAction>
          </AttachmentActions>
        )}

        {!uploading && (
          <AttachmentTrigger
            aria-label={label}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          />
        )}
      </Attachment>
    </div>
  );
}

export type { FileUploadProps, UploadedFile };
export { FileUpload };

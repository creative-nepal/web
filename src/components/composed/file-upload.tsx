"use client";

import { RiCloseLine, RiUpload2Line } from "@remixicon/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  /**
   * Performs the upload and resolves the stored file's id and a URL to preview
   * it by. Transport differs per app — business-scoped in the workspace,
   * platform-scoped in admin — so it is injected rather than assumed here.
   */
  onUpload: (file: File) => Promise<{ id: string; url: string }>;
  value?: { id: string; url: string } | null;
  onChange?: (value: { id: string; url: string } | null) => void;
  accept?: string;
  label: string;
  replaceLabel: string;
  clearLabel: string;
  hint?: string;
  preview?: boolean;
  disabled?: boolean;
}

function FileUpload({
  onUpload,
  value = null,
  onChange,
  accept = "image/jpeg,image/png,image/webp",
  label,
  replaceLabel,
  clearLabel,
  hint,
  preview = true,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setBusy(true);
    setError(null);

    try {
      onChange?.(await onUpload(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handle(file);
          }
          event.target.value = "";
        }}
      />

      {preview && value?.url && (
        // biome-ignore lint/performance/noImgElement: the URL is a signed, short-lived object-storage link, which next/image cannot cache
        <img
          src={value.url}
          alt=""
          className="size-24 rounded-none border object-cover"
        />
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={value ? "outline" : "default"}
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          <RiUpload2Line className="size-4" />
          {value ? replaceLabel : label}
        </Button>

        {value && onChange && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || busy}
            onClick={() => onChange(null)}
          >
            <RiCloseLine className="size-4" />
            {clearLabel}
          </Button>
        )}
      </div>

      {hint && !error && (
        <span className="text-muted-foreground text-xs">{hint}</span>
      )}
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}

export type { FileUploadProps };
export { FileUpload };

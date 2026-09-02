"use client";

import { RiCheckLine, RiUpload2Line } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/features/files/services";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export function PrescriptionUpload({
  businessId,
  fileId,
  onUploaded,
}: {
  businessId: string;
  fileId: string | null;
  onUploaded: (fileId: string) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: (file: File) => uploadFile(businessId, file, "prescription"),
    onSuccess: (stored) => {
      onUploaded(stored.id);
      toast.success(t("ui.web.pos.prescriptionUploaded"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ??
          (error instanceof Error ? error.message : t("ui.error.generic")),
      );
    },
  });

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            upload.mutate(file);
          }
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        size="sm"
        variant={fileId ? "outline" : "default"}
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {fileId ? (
          <RiCheckLine className="size-4" />
        ) : (
          <RiUpload2Line className="size-4" />
        )}
        {fileId
          ? t("ui.web.pos.prescriptionAttached")
          : t("ui.web.pos.attachPrescription")}
      </Button>
    </div>
  );
}

"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileUpload } from "@/components/composed/file-upload";
import { uploadBusinessFile } from "@/features/files/services";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

export function PrescriptionUpload({
  businessId,
  fileId,
  onUploaded,
}: {
  businessId: string;
  fileId: string | null;
  onUploaded: (fileId: string | null) => void;
}) {
  const { t } = useTranslation();

  const upload = useMutation({
    mutationFn: (file: File) =>
      uploadBusinessFile(businessId, file, "prescription"),
  });

  return (
    <FileUpload
      accept="image/jpeg,image/png,image/webp,application/pdf"
      label={t("ui.web.pos.attachPrescription")}
      clearLabel={t("ui.action.cancel")}
      hint={t("ui.web.pos.prescriptionHint")}
      value={
        fileId
          ? { id: fileId, url: "", name: t("ui.web.pos.prescriptionAttached") }
          : null
      }
      image={false}
      onChange={(next) => onUploaded(next?.id ?? null)}
      onUpload={async (file) => {
        const stored = await upload.mutateAsync(file);
        toast.success(t("ui.web.pos.prescriptionUploaded"));
        return { ...stored, name: file.name };
      }}
    />
  );
}

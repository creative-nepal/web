"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import type { ComplianceState } from "../types";
import { PrescriptionUpload } from "./prescription-upload";

interface ComplianceFieldsProps {
  businessId: string;
  value: ComplianceState;
  onChange: (patch: Partial<ComplianceState>) => void;
  requiresBuyerPan: boolean;
  requiresPrescription: boolean;
  requiresBuyerIdentity: boolean;
}

export function ComplianceFields({
  businessId,
  value,
  onChange,
  requiresBuyerPan,
  requiresPrescription,
  requiresBuyerIdentity,
}: ComplianceFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      {requiresBuyerPan && (
        <div className="flex flex-col gap-2 rounded-md border border-dashed p-3">
          <p className="text-muted-foreground text-xs">
            {t("ui.web.pos.panRequired")}
          </p>
          <Input
            placeholder={t("ui.web.pos.buyerName")}
            value={value.buyerName}
            onChange={(event) => onChange({ buyerName: event.target.value })}
          />
          <Input
            placeholder={t("ui.web.pos.buyerPan")}
            value={value.buyerPan}
            onChange={(event) => onChange({ buyerPan: event.target.value })}
          />
        </div>
      )}

      {requiresPrescription && (
        <div className="flex flex-col gap-2 rounded-md border border-dashed p-3">
          <Label className="text-xs">
            {t("ui.web.pos.prescriptionRequired")}
          </Label>
          <Input
            placeholder={t("ui.web.pos.prescribingDoctor")}
            value={value.doctorName}
            onChange={(event) => onChange({ doctorName: event.target.value })}
          />
          <Input
            placeholder={t("ui.web.pos.patientName")}
            value={value.patientName}
            onChange={(event) => onChange({ patientName: event.target.value })}
          />
          {requiresBuyerIdentity && (
            <Input
              placeholder={t("ui.web.pos.buyerCitizenship")}
              value={value.idNumber}
              onChange={(event) => onChange({ idNumber: event.target.value })}
            />
          )}
          <PrescriptionUpload
            businessId={businessId}
            fileId={value.prescriptionFileId}
            onUploaded={(prescriptionFileId) =>
              onChange({ prescriptionFileId })
            }
          />
        </div>
      )}
    </>
  );
}

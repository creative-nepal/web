"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/composed/file-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { businessQueryKeys } from "@/features/business/queries";
import type { Business } from "@/features/business/types";
import { uploadBusinessFile } from "@/features/files/services";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { updateBranding } from "../services";

export function BrandingCard({ business }: { business: Business }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState(business.displayName ?? "");
  const [primary, setPrimary] = useState(business.theme?.primary ?? "");
  const [logo, setLogo] = useState<{ id: string; url: string } | null>(
    business.theme?.logoUrl
      ? { id: business.theme.logoUrl, url: business.theme.logoUrl }
      : null,
  );

  const save = useMutation({
    mutationFn: () =>
      updateBranding(business.id, {
        displayName: displayName.trim() || undefined,
        theme: {
          ...(primary.trim() ? { primary: primary.trim() } : {}),
          ...(logo ? { logoUrl: logo.url } : {}),
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
      toast.success(t("ui.web.settings.brandingSaved"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ui.web.settings.brandingTitle")}</CardTitle>
        <CardDescription>
          {t("ui.web.settings.brandingDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="display-name">
            {t("ui.web.settings.displayName")}
          </Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={business.legalName}
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="primary-colour">
            {t("ui.web.settings.primaryColour")}
          </Label>
          <Input
            id="primary-colour"
            value={primary}
            onChange={(event) => setPrimary(event.target.value)}
            placeholder="oklch(0.55 0.18 250)"
            className="max-w-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t("ui.web.settings.logo")}</Label>
          <FileUpload
            label={t("ui.web.settings.uploadLogo")}
            clearLabel={t("ui.action.cancel")}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            value={logo}
            onChange={setLogo}
            onUpload={(file) =>
              uploadBusinessFile(business.id, file, "business-logo")
            }
          />
        </div>

        <div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {t("ui.action.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

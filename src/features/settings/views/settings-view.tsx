"use client";

import { PageHeader } from "@/components/composed/page-header";
import {
  useBusinessContext,
  useCurrentBusiness,
} from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { AccountBillingCard } from "../components/account-billing-card";
import { BusinessDetailsCard } from "../components/business-details-card";
import { PlanCard } from "../components/plan-card";

export function SettingsView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const { businesses } = useBusinessContext();

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.settings.title")}
        description={t("ui.web.settings.description")}
      />
      <BusinessDetailsCard business={business} />
      <PlanCard businessId={business.id} />
      <AccountBillingCard businessCount={businesses.length} />
    </div>
  );
}

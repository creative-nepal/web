"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { rolesQueryOptions } from "../queries";

export function useAssignableRoles(): { value: string; label: string }[] {
  const { t } = useTranslation();
  const business = useCurrentBusiness();
  const { data } = useQuery(rolesQueryOptions(business?.id ?? ""));

  return (data?.roles ?? [])
    .filter((role) => role.role !== "owner")
    .map((role) => ({
      value: role.role,
      label: t(`common.role.${role.role}`) || role.role,
    }));
}

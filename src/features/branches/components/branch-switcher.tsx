"use client";

import { RiArrowDownSLine, RiMapPin2Line } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { useBranchStore } from "@/stores/branch-store";
import { branchesQueryOptions } from "../queries";

export function BranchSwitcher() {
  const { t } = useTranslation();
  const business = useCurrentBusiness();
  const currentBranchId = useBranchStore((state) => state.currentBranchId);
  const setCurrentBranchId = useBranchStore(
    (state) => state.setCurrentBranchId,
  );

  const { data } = useQuery(branchesQueryOptions(business?.id ?? ""));
  const branches = (data?.data ?? []).filter((branch) => branch.isActive);

  const current =
    branches.find((branch) => branch.id === currentBranchId) ??
    branches.find((branch) => branch.isDefault) ??
    branches[0];

  useEffect(() => {
    if (branches.length === 0) {
      return;
    }

    if (!branches.some((branch) => branch.id === currentBranchId)) {
      setCurrentBranchId(current?.id ?? null);
    }
  }, [branches, currentBranchId, current, setCurrentBranchId]);

  if (branches.length < 2 || !current) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="w-full justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <RiMapPin2Line className="size-4 shrink-0" />
              <span className="truncate">{current.name}</span>
            </span>
            <RiArrowDownSLine className="size-4 shrink-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64">
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => setCurrentBranchId(branch.id)}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="truncate">{branch.name}</span>
              {branch.code && <Badge variant="secondary">{branch.code}</Badge>}
              {branch.isDefault && !branch.code && (
                <Badge variant="outline">{t("ui.field.branch")}</Badge>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

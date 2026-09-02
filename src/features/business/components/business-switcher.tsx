"use client";

import { RiArrowDownSLine, RiStore2Line } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { useBusinessContext } from "../business-provider";

export function BusinessSwitcher() {
  const { t } = useTranslation();
  const { businesses, currentBusiness, switchBusiness } = useBusinessContext();

  if (!currentBusiness) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="w-full justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <RiStore2Line className="size-4 shrink-0" />
              <span className="truncate">{currentBusiness.legalName}</span>
            </span>
            <RiArrowDownSLine className="size-4 shrink-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64">
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => switchBusiness(business.id)}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="truncate">{business.legalName}</span>
              <Badge variant="secondary">
                {t(`common.sector.${business.sector}`)}
              </Badge>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

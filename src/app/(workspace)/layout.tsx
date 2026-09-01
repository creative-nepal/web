"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { useState } from "react";
import {
  DashboardShell,
  type DashboardShellNavItem,
} from "@/components/composed/dashboard-shell";
import { EmptyState } from "@/components/composed/empty-state";
import { QueryBoundary } from "@/components/query-boundary";
import {
  BusinessProvider,
  useBusinessContext,
} from "@/features/business/business-provider";
import { BusinessSwitcher } from "@/features/business/components/business-switcher";
import { navItemsForSector } from "@/features/business/nav-items";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

function WorkspaceChrome({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const { currentBusiness, isLoading } = useBusinessContext();

  if (isLoading) {
    return null;
  }

  if (!currentBusiness) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <EmptyState
          title={t("ui.web.workspace.noBusinessTitle")}
          description={t("ui.web.workspace.noBusinessBody")}
        />
      </div>
    );
  }

  const items: DashboardShellNavItem[] = navItemsForSector(
    currentBusiness.sector,
    t,
  ).map((item) => ({
    title: item.title,
    href: item.href,
    isActive: pathname.startsWith(item.href),
  }));

  return (
    <DashboardShell
      navItems={items}
      header={<BusinessSwitcher />}
      open={open}
      onOpenChange={setOpen}
      renderLink={(item, button) => <Link href={item.href}>{button}</Link>}
    >
      <QueryBoundary>{children}</QueryBoundary>
    </DashboardShell>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessProvider>
      <WorkspaceChrome>{children}</WorkspaceChrome>
    </BusinessProvider>
  );
}

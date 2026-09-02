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
import { BranchSwitcher } from "@/features/branches/components/branch-switcher";
import {
  BusinessProvider,
  useBusinessContext,
} from "@/features/business/business-provider";
import { BusinessSwitcher } from "@/features/business/components/business-switcher";
import { WorkspaceTheme } from "@/features/business/components/workspace-theme";
import { useWorkspace } from "@/features/business/hooks/use-workspace";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

function WorkspaceChrome({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const { currentBusiness, isLoading } = useBusinessContext();
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspace();

  if (isLoading || isWorkspaceLoading) {
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

  const items: DashboardShellNavItem[] = (workspace?.nav ?? []).map((item) => ({
    title: t(item.titleKey),
    href: item.href,
    isActive: pathname.startsWith(item.href),
  }));

  return (
    <DashboardShell
      navItems={items}
      header={
        <div className="flex flex-col gap-2">
          <BusinessSwitcher />
          <BranchSwitcher />
        </div>
      }
      open={open}
      onOpenChange={setOpen}
      renderLink={(item, button) => <Link href={item.href}>{button}</Link>}
    >
      <WorkspaceTheme>
        <QueryBoundary>{children}</QueryBoundary>
      </WorkspaceTheme>
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

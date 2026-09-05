"use client";

import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface DashboardShellNavItem {
  title: string;
  href: string;
  group?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface DashboardShellNavGroup {
  key: string;
  label?: string;
}

interface DashboardShellProps {
  navItems: DashboardShellNavItem[];
  navGroups?: DashboardShellNavGroup[];
  navGroupLabel?: string;
  collapsible?: "offcanvas" | "icon" | "none";
  header?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  renderLink?: (
    item: DashboardShellNavItem,
    children: React.ReactNode,
  ) => React.ReactNode;
}

function DashboardShell({
  navItems,
  navGroups,
  navGroupLabel,
  collapsible,
  header,
  headerActions,
  footer,
  open,
  onOpenChange,
  children,
  renderLink,
}: DashboardShellProps) {
  return (
    <SidebarProvider open={open} onOpenChange={onOpenChange}>
      <Sidebar collapsible={collapsible}>
        {header && <SidebarHeader>{header}</SidebarHeader>}
        <SidebarContent>
          {(navGroups ?? [{ key: "", label: navGroupLabel }]).map((group) => {
            const items = navGroups
              ? navItems.filter((item) => item.group === group.key)
              : navItems;

            if (items.length === 0) {
              return null;
            }

            return (
              <SidebarGroup key={group.key}>
                {group.label && (
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                )}
                <SidebarMenu>
                  {items.map((item) => {
                    const button = (
                      <SidebarMenuButton
                        isActive={item.isActive}
                        tooltip={item.title}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    );

                    return (
                      <SidebarMenuItem key={item.href}>
                        {renderLink ? renderLink(item, button) : button}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        {footer && <SidebarFooter>{footer}</SidebarFooter>}
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />
          {headerActions && (
            <div className="flex items-center gap-1">{headerActions}</div>
          )}
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-[88rem]">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export type {
  DashboardShellNavGroup,
  DashboardShellNavItem,
  DashboardShellProps,
};
export { DashboardShell };

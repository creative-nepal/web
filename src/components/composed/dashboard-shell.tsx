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
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface DashboardShellProps {
  navItems: DashboardShellNavItem[];
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
          <SidebarGroup>
            {navGroupLabel && (
              <SidebarGroupLabel>{navGroupLabel}</SidebarGroupLabel>
            )}
            <SidebarMenu>
              {navItems.map((item) => {
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
        </SidebarContent>
        {footer && <SidebarFooter>{footer}</SidebarFooter>}
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center justify-between gap-2 border-b p-3">
          <SidebarTrigger />
          {headerActions && (
            <div className="flex items-center gap-1">{headerActions}</div>
          )}
        </div>
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export type { DashboardShellNavItem, DashboardShellProps };
export { DashboardShell };

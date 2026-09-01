"use client";

import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiExpandUpDownLine,
  RiEyeOffLine,
} from "@remixicon/react";
import type { Column, RowData } from "@tanstack/react-table";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DataTableFeatures } from "./data-table";

interface DataTableColumnHeaderProps<TData extends RowData, TValue>
  extends React.ComponentProps<"div"> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
}

function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div className={cn(className)} {...props}>
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" className="-ml-3 h-8">
              <span>{title}</span>
              {sorted === "desc" ? (
                <RiArrowDownLine className="size-3.5" />
              ) : sorted === "asc" ? (
                <RiArrowUpLine className="size-3.5" />
              ) : (
                <RiExpandUpDownLine className="size-3.5" />
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <RiArrowUpLine />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <RiArrowDownLine />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <RiEyeOffLine />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export type { DataTableColumnHeaderProps };
export { DataTableColumnHeader };

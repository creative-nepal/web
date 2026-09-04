"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  columnFilteringFeature,
  columnVisibilityFeature,
  type OnChangeFn,
  type PaginationState,
  type ReactTable,
  type RowSelectionState,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { EmptyState } from "./empty-state";

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
});

type DataTableFeatures = typeof features;

interface DataTableProps<TData extends object> {
  columns: ColumnDef<DataTableFeatures, TData, unknown>[];
  data: TData[];
  rowCount: number;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  columnVisibility?: ColumnVisibilityState;
  onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  isLoading?: boolean;
  emptyMessage?: string;
  toolbar?: (table: ReactTable<DataTableFeatures, TData>) => React.ReactNode;
  pageSizeOptions?: number[];
}

function DataTable<TData extends object>({
  columns,
  data,
  rowCount,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  pagination,
  onPaginationChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  isLoading = false,
  emptyMessage = "No results.",
  toolbar,
  pageSizeOptions,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    columns,
    data,
    rowCount,
    state: {
      sorting,
      columnFilters,
      pagination,
      ...(columnVisibility && { columnVisibility }),
      ...(rowSelection && { rowSelection }),
    },
    onSortingChange,
    onColumnFiltersChange,
    onPaginationChange,
    ...(onColumnVisibilityChange && { onColumnVisibilityChange }),
    ...(onRowSelectionChange && { onRowSelectionChange }),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      {toolbar && (
        <div className="flex items-center justify-between gap-2">
          {toolbar(table)}
        </div>
      )}
      <div className="overflow-hidden rounded-none border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyState title="Loading…" />
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyState title={emptyMessage} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}

export type { DataTableFeatures, DataTableProps };
export { DataTable };

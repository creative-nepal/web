import type * as React from "react";
import { EmptyState } from "@/components/composed/empty-state";

interface DataSectionProps {
  isEmpty: boolean;
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  children: React.ReactNode;
}

export function DataSection({
  isEmpty,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  children,
}: DataSectionProps) {
  if (!isLoading && isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children}</>;
}

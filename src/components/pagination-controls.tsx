"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-sm">
        {t("ui.field.resultCount", { count: total })}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(Math.max(page - 1, 0))}
        >
          {t("ui.action.previous")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={(page + 1) * pageSize >= total}
          onClick={() => onPageChange(page + 1)}
        >
          {t("ui.action.next")}
        </Button>
      </div>
    </div>
  );
}

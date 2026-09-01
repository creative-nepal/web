"use client";

import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ContentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A general-purpose controlled dialog for arbitrary content (forms, details, previews).
 * For destructive/confirm actions, use `ConfirmDialog` instead — it's built on `AlertDialog`,
 * which is the accessible primitive for that pattern.
 */
function ContentDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  children,
}: ContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export type { ContentDialogProps };
export { ContentDialog };

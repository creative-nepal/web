import type * as React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface ErrorStateProps
  extends Omit<React.ComponentProps<typeof Empty>, "title"> {
  code?: string;
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  digest?: string;
  digestLabel?: string;
  action?: React.ReactNode;
}

function ErrorState({
  code,
  icon,
  title,
  description,
  digest,
  digestLabel = "Reference",
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <Empty className={cn("gap-3", className)} {...props}>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        {code && (
          <span className="font-mono text-3xl leading-none font-semibold tabular-nums text-muted-foreground">
            {code}
          </span>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
      {digest && (
        <p className="font-mono text-[10px] text-muted-foreground/70">
          {digestLabel}: {digest}
        </p>
      )}
    </Empty>
  );
}

export type { ErrorStateProps };
export { ErrorState };

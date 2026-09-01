"use client";

import { RiErrorWarningLine } from "@remixicon/react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { catchError } from "next/error";
import type * as React from "react";
import { useEffect } from "react";
import { ErrorState } from "@/components/composed/error-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { logRouteError } from "@/lib/log-error";

function toError(value: unknown): Error & { digest?: string } {
  return value instanceof Error ? value : new Error(String(value));
}

function DataErrorFallback({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    logRouteError(toError(error), "query-boundary");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <ErrorState
        icon={<RiErrorWarningLine />}
        title={t("ui.error.dataFailedTitle")}
        description={t("ui.error.dataFailedBody")}
        digest={toError(error).digest}
        action={<Button onClick={onRetry}>{t("ui.action.tryAgain")}</Button>}
      />
    </div>
  );
}

const DataBoundary = catchError<{ resetQueries: () => void }>(
  ({ resetQueries }, { error, retry }) => (
    <DataErrorFallback
      error={error}
      onRetry={() => {
        resetQueries();
        retry();
      }}
    />
  ),
);

export function QueryBoundary({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <DataBoundary resetQueries={reset}>{children}</DataBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

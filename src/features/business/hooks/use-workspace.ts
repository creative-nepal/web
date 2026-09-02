"use client";

import { useQuery } from "@tanstack/react-query";
import { useBusinessContext } from "../business-provider";
import { workspaceQueryOptions } from "../queries";
import type { Workspace } from "../types";

export function useWorkspace(): {
  workspace: Workspace | undefined;
  isLoading: boolean;
} {
  const { currentBusiness } = useBusinessContext();

  const { data, isLoading } = useQuery(
    workspaceQueryOptions(currentBusiness?.id ?? ""),
  );

  return { workspace: data, isLoading };
}

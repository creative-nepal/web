"use client";

import { useWorkspace } from "./use-workspace";

export type PermissionRequest = Record<string, string[]>;

export function usePermission(required: PermissionRequest): boolean {
  const { workspace } = useWorkspace();

  if (!workspace) {
    return false;
  }

  return Object.entries(required).every(([resource, actions]) =>
    actions.every((action) =>
      workspace.permissions[resource]?.includes(action),
    ),
  );
}

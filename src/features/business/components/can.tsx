"use client";

import type * as React from "react";
import type { PermissionRequest } from "../hooks/use-permission";
import { usePermission } from "../hooks/use-permission";

export function Can({
  permission,
  fallback = null,
  children,
}: {
  permission: PermissionRequest;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactNode {
  return usePermission(permission) ? children : fallback;
}

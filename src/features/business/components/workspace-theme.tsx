"use client";

import { useWorkspace } from "../hooks/use-workspace";

export function WorkspaceTheme({ children }: { children: React.ReactNode }) {
  const { workspace } = useWorkspace();
  const theme = workspace?.branding.theme;

  const style: Record<string, string> = {};

  if (theme?.primary) {
    style["--primary"] = theme.primary;
  }
  if (theme?.primaryForeground) {
    style["--primary-foreground"] = theme.primaryForeground;
  }
  if (theme?.accent) {
    style["--accent"] = theme.accent;
  }
  if (theme?.radius) {
    style["--radius"] = theme.radius;
  }

  return (
    <div className="contents" style={style as React.CSSProperties}>
      {children}
    </div>
  );
}

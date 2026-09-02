export interface Notification {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  titleKey: string;
  bodyKey: string | null;
  params: Record<string, string | number>;
  href: string | null;
  createdAt: string;
  read: boolean;
}

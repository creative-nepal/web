import { Badge } from "@/components/ui/badge";

type Variant = "default" | "secondary" | "outline" | "destructive";

interface StatusBadgeProps {
  value: string;
  variants?: Record<string, Variant>;
  labels?: Record<string, string>;
  fallback?: Variant;
}

export function StatusBadge({
  value,
  variants = {},
  labels = {},
  fallback = "outline",
}: StatusBadgeProps) {
  return (
    <Badge variant={variants[value] ?? fallback}>
      {labels[value] ?? value.replace(/_/g, " ")}
    </Badge>
  );
}

import type * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  config: ChartConfig;
  children: React.ComponentProps<typeof ChartContainer>["children"];
  className?: string;
}

function ChartCard({
  title,
  description,
  action,
  config,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>{children}</ChartContainer>
      </CardContent>
    </Card>
  );
}

export type { ChartCardProps };
export { ChartCard };

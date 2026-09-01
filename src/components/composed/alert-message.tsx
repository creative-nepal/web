import type * as React from "react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface AlertMessageProps extends React.ComponentProps<typeof Alert> {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

function AlertMessage({
  icon,
  title,
  description,
  action,
  children,
  ...props
}: AlertMessageProps) {
  return (
    <Alert {...props}>
      {icon}
      <AlertTitle>{title}</AlertTitle>
      {(description || children) && (
        <AlertDescription>{description ?? children}</AlertDescription>
      )}
      {action && <AlertAction>{action}</AlertAction>}
    </Alert>
  );
}

export type { AlertMessageProps };
export { AlertMessage };

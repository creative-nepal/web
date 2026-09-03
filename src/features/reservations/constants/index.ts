export const RESERVATION_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  booked: "default",
  seated: "secondary",
  completed: "outline",
  no_show: "destructive",
  cancelled: "outline",
};

export const DEFAULT_DURATION_MINUTES = 90;

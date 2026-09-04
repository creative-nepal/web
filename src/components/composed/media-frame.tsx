import type * as React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface MediaFrameProps extends React.ComponentProps<"img"> {
  ratio?: number;
  containerClassName?: string;
}

function MediaFrame({
  ratio = 16 / 9,
  containerClassName,
  className,
  alt,
  ...props
}: MediaFrameProps) {
  return (
    <AspectRatio ratio={ratio} className={containerClassName}>
      <img
        className={cn("size-full object-cover", className)}
        alt={alt}
        {...props}
      />
    </AspectRatio>
  );
}

export type { MediaFrameProps };
export { MediaFrame };

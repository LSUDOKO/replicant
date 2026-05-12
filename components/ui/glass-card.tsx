import * as React from "react";

import { cn } from "@/lib/utils";

function GlassCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "glass-refraction rounded-2xl bg-surface/70 text-card-foreground backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

export { GlassCard };

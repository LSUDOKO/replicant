import * as React from "react";
import { type VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ActionButton({
  className,
  ...props
}: React.ComponentProps<typeof Button> & VariantProps<typeof buttonVariants>) {
  return (
    <Button
      className={cn(
        "rounded-full bg-accent-success px-6 text-background shadow-[0_0_24px_rgba(34,197,94,0.16)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-accent-success/95 hover:shadow-[0_0_34px_rgba(34,197,94,0.22)] active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}

export { ActionButton };

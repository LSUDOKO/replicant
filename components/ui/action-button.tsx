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
        "h-[58px] rounded-[18px] bg-gradient-to-b from-[#9F67FF] to-[#7C3AED] text-white text-[15px] font-semibold tracking-[0.3px] shadow-[0_10px_40px_rgba(139,92,246,0.35)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-[2px] hover:shadow-[0_20px_50px_rgba(139,92,246,0.45)] active:translate-y-0",
        className
      )}
      {...props}
    />
  );
}

export { ActionButton };

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("h-11 w-full rounded-full border border-border bg-card/90 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";

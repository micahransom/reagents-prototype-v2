import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs font-semibold transition-colors rounded-lg border whitespace-nowrap",
  {
    variants: {
      variant: {
        inProgress: "bg-orange-100 border-orange-200 text-secondary-foreground",
        completed: "bg-lime-100 border-lime-300 text-secondary-foreground",
        default: "bg-secondary border-border text-secondary-foreground",
        outline: "bg-background border-border text-foreground",
        secondary: "bg-secondary border-transparent text-secondary-foreground",
        neutral: "bg-neutral-100 border-neutral-300 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

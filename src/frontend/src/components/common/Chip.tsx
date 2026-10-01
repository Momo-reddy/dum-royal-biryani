import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  /** Visual emphasis of the chip. */
  variant?: "default" | "accent" | "outline";
  className?: string;
}

/** Small pill label used for tags, dietary markers, and highlights. */
export function Chip({ children, variant = "default", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        variant === "default" && "bg-secondary text-secondary-foreground",
        variant === "accent" && "bg-primary/15 text-primary",
        variant === "outline" && "border border-border text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

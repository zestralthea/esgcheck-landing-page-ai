import * as React from "react";
import { cn } from "@/lib/utils";

interface FeatureIndicatorProps {
  text: string;
  className?: string;
}

/**
 * A small reusable component for displaying feature indicators with a colored dot.
 * Used in hero sections and feature lists.
 */
export function FeatureIndicator({ text, className }: FeatureIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="w-2 h-2 bg-success rounded-full"></div>
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

/**
 * A container for multiple FeatureIndicator components that handles responsive layout.
 */
export function FeatureIndicatorGroup({ 
  children,
  className
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8",
      className
    )}>
      {children}
    </div>
  );
}
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  containerClassName?: string;
}

/**
 * A reusable card component with gradient styling and optional hover effects
 * Used throughout the application for consistent styling of card elements
 */
export function GradientCard({
  children,
  hoverEffect = true,
  className,
  containerClassName,
  ...props
}: GradientCardProps) {
  return (
    <Card 
      className={cn(
        "border border-border/20 shadow-premium bg-gradient-card backdrop-blur",
        hoverEffect && "transition-all duration-500 hover:scale-105 hover:shadow-glow group",
        className
      )}
      {...props}
    >
      <div className={cn("", containerClassName)}>
        {children}
      </div>
    </Card>
  );
}
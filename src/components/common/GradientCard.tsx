import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardProps } from "@/components/ui/card";

interface GradientCardProps extends CardProps {
  children: ReactNode;
  hoverEffect?: boolean;
  className?: string;
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
    ></Card>
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { cardVariants, type CardVariantProps } from "@/lib/variants";

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement>, CardVariantProps {
  children: React.ReactNode;
  containerClassName?: string;
}

/**
 * A reusable card component with gradient styling and optional hover effects
 * Uses cardVariants from variants.ts for consistent styling
 */
export function GradientCard({
  children,
  className,
  containerClassName,
  variant = "gradient",
  hover = "full",
  ...props
}: GradientCardProps) {
  return (
    <Card 
      className={cn(
        cardVariants({ variant, hover }),
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
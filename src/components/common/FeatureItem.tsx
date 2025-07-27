import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { GradientCard } from "./GradientCard";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

/**
 * A reusable component for displaying feature items with icons
 * Used in the Features component and potentially elsewhere
 */
export function FeatureItem({
  icon: Icon,
  title,
  description,
  className
}: FeatureItemProps) {
  return (
    <GradientCard className={cn("max-w-sm", className)}>
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300 mx-auto">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <CardDescription className="text-base text-center">
          {description}
        </CardDescription>
      </CardContent>
    </GradientCard>
  );
}
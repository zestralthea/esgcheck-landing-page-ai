import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  secondaryDescription?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  centered?: boolean;
}

/**
 * A reusable component for section headings with consistent styling
 * Used across the application for section titles and descriptions
 */
export function SectionHeading({
  title,
  description,
  secondaryDescription,
  className,
  titleClassName,
  descriptionClassName,
  centered = true,
}: SectionHeadingProps) {
  return (
    <div className={cn(
      "space-y-4 mb-16",
      centered && "text-center",
      className
    )}>
      <h2 className={cn(
        "text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight",
        titleClassName
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn(
          "text-lg md:text-xl leading-7 md:leading-8 text-foreground/90",
          centered && "max-w-[65ch] mx-auto",
          descriptionClassName
        )}>
          {description}
          {secondaryDescription && (
            <>
              <br />
              {secondaryDescription}
            </>
          )}
        </p>
      )}
    </div>
  );
}

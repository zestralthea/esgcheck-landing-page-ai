import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientOverlayProps {
  className?: string;
  type?: "solid" | "gradient" | "blur" | "combined";
  opacity?: "light" | "medium" | "heavy";
  zIndex?: number;
  mediaOverlay?: boolean;
}

/**
 * A reusable component for creating gradient overlays
 * Used to improve text readability over images or videos
 */
export function GradientOverlay({
  className,
  type = "gradient",
  opacity = "medium",
  zIndex = 10,
  mediaOverlay = false
}: GradientOverlayProps) {
  // Map opacity to actual class values
  const regularClasses = {
    light: {
      solid: "bg-background/50",
      gradient: "bg-gradient-to-br from-background/50 via-background/30 to-background/40",
      blur: "bg-background/30 backdrop-blur-sm",
      combined: "bg-gradient-to-br from-background/60 via-background/40 to-background/50 backdrop-blur-sm"
    },
    medium: {
      solid: "bg-background/70",
      gradient: "bg-gradient-to-br from-background/80 via-background/60 to-background/70",
      blur: "bg-background/50 backdrop-blur-md",
      combined: "bg-gradient-to-br from-background/80 via-background/60 to-background/70 backdrop-blur-sm"
    },
    heavy: {
      solid: "bg-background/90",
      gradient: "bg-gradient-to-br from-background/90 via-background/80 to-background/90",
      blur: "bg-background/70 backdrop-blur-lg",
      combined: "bg-gradient-to-br from-background/90 via-background/80 to-background/90 backdrop-blur-md"
    }
  };

  // Darker overlay classes for media backgrounds
  const mediaClasses = {
    light: {
      solid: "bg-media-background/50",
      gradient: "bg-gradient-to-br from-media-background/50 via-media-background/30 to-media-background/40",
      blur: "bg-media-background/30 backdrop-blur-sm",
      combined: "bg-gradient-to-br from-media-background/60 via-media-background/40 to-media-background/50 backdrop-blur-sm"
    },
    medium: {
      solid: "bg-media-background/70",
      gradient: "bg-gradient-to-br from-media-background/80 via-media-background/60 to-media-background/70",
      blur: "bg-media-background/50 backdrop-blur-md",
      combined: "bg-gradient-to-br from-media-background/80 via-media-background/60 to-media-background/70 backdrop-blur-sm"
    },
    heavy: {
      solid: "bg-media-background/90",
      gradient: "bg-gradient-to-br from-media-background/90 via-media-background/80 to-media-background/90",
      blur: "bg-media-background/70 backdrop-blur-lg",
      combined: "bg-gradient-to-br from-media-background/90 via-media-background/80 to-media-background/90 backdrop-blur-md"
    }
  };

  const opacityClasses = mediaOverlay ? mediaClasses : regularClasses;

  return (
    <div 
      className={cn(
        "absolute inset-0",
        opacityClasses[opacity][type],
        className
      )}
      style={{ zIndex }}
    ></div>
  );
}
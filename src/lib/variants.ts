import { cva, type VariantProps } from "class-variance-authority";

/**
 * Button variants using class-variance-authority
 * Provides consistent styling options for buttons throughout the application
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow/60 hover:scale-105 transition-all duration-300",
        premium: "bg-gradient-primary text-primary-foreground shadow-premium hover:shadow-premium/80 hover:scale-105 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Card variants using class-variance-authority
 * Provides consistent styling options for cards throughout the application
 */
export const cardVariants = cva(
  "rounded-lg border border-border/40 bg-[hsl(var(--card)/0.45)] backdrop-blur-lg text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        gradient: [
          "border border-border/20 shadow-premium",
          // Translucent gradient (semi‑transparent stops) for modern glass look
          "bg-gradient-to-br",
          "from-[hsl(var(--card)/0.50)]",
          "to-[hsl(var(--card)/0.60)]",
          "backdrop-blur-lg"
        ].join(" "),
        outline: "border-2",
        premium: "border border-border/20 shadow-premium bg-gradient-primary backdrop-blur",
      },
      hover: {
        none: "",
        scale: "transition-all duration-500 hover:scale-105 group",
        glow: "hover:shadow-glow transition-all duration-300",
        full: "transition-all duration-500 hover:scale-105 hover:shadow-glow group",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type CardVariantProps = VariantProps<typeof cardVariants>;

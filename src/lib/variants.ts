import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-card hover:bg-primary/92",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95",
        premium: "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95",
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

export const cardVariants = cva(
  "rounded-2xl border border-border/80 bg-card text-card-foreground shadow-card",
  {
    variants: {
      variant: {
        default: "",
        gradient: "border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--secondary))_100%)] shadow-card",
        outline: "border-2",
        premium: "border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--accent))_100%)] shadow-elegant",
      },
      hover: {
        none: "",
        scale: "transition-transform duration-300 hover:-translate-y-1 group",
        glow: "transition-shadow duration-300 hover:shadow-elegant",
        full: "transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant group",
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

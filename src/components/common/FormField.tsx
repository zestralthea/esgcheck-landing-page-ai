import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.ComponentProps<"input"> {
  error?: string;
  label?: string;
}

/**
 * A reusable form field component that includes an input with optional label and error message.
 * Used to standardize form inputs across the application.
 */
export function FormField({
  name,
  error,
  label,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={name} 
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div>
        <Input
          id={name}
          name={name}
          className={cn(
            "h-11",
            error ? "border-destructive" : "",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        {error && (
          <p 
            id={`${name}-error`}
            className="text-sm text-destructive mt-1"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, InputProps } from "@/components/ui/input";

interface FormFieldProps extends Omit<InputProps, "onChange"> {
  name: string;
  label?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

/**
 * FormField component for standardized form input fields with validation
 * 
 * Provides consistent styling and error handling for form inputs
 */
export function FormField({
  name,
  label,
  error,
  className,
  onChange,
  onBlur,
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
        </label>
      )}
      <Input
        id={name}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
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
  );
}
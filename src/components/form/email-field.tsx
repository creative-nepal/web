"use client";

import type * as React from "react";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFormField } from "./use-form-field";

interface EmailFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "name" | "type"> {
  name: string;
  label?: string;
  description?: string;
}

function EmailField({ name, label, description, ...props }: EmailFieldProps) {
  const { control, error } = useFormField(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={Boolean(error)}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <FieldContent>
            <Input
              id={name}
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(error)}
              {...field}
              {...props}
            />
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={error ? [error] : undefined} />
          </FieldContent>
        </Field>
      )}
    />
  );
}

export type { EmailFieldProps };
export { EmailField };

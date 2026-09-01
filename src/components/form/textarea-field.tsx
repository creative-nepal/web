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
import { Textarea } from "@/components/ui/textarea";
import { useFormField } from "./use-form-field";

interface TextareaFieldProps
  extends Omit<React.ComponentProps<typeof Textarea>, "name"> {
  name: string;
  label?: string;
  description?: string;
}

function TextareaField({
  name,
  label,
  description,
  ...props
}: TextareaFieldProps) {
  const { control, error } = useFormField(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={Boolean(error)}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <FieldContent>
            <Textarea
              id={name}
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

export type { TextareaFieldProps };
export { TextareaField };

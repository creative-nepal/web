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

interface NumberFieldProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "name" | "type" | "onChange"
  > {
  name: string;
  label?: string;
  description?: string;
}

function NumberField({ name, label, description, ...props }: NumberFieldProps) {
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
              type="number"
              aria-invalid={Boolean(error)}
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              value={Number.isNaN(field.value) ? "" : field.value}
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

export type { NumberFieldProps };
export { NumberField };

"use client";

import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useFormField } from "./use-form-field";

interface CheckboxFieldProps {
  name: string;
  label?: string;
  description?: string;
}

function CheckboxField({ name, label, description }: CheckboxFieldProps) {
  const { control, error } = useFormField(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" data-invalid={Boolean(error)}>
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            aria-invalid={Boolean(error)}
          />
          <FieldContent>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={error ? [error] : undefined} />
          </FieldContent>
        </Field>
      )}
    />
  );
}

export type { CheckboxFieldProps };
export { CheckboxField };

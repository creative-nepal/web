"use client";

import { Controller } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useFormField } from "./use-form-field";

interface SwitchFieldProps {
  name: string;
  label?: string;
  description?: string;
}

function SwitchField({ name, label, description }: SwitchFieldProps) {
  const { control, error } = useFormField(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal" data-invalid={Boolean(error)}>
          <FieldContent>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={error ? [error] : undefined} />
          </FieldContent>
          <Switch
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            aria-invalid={Boolean(error)}
          />
        </Field>
      )}
    />
  );
}

export type { SwitchFieldProps };
export { SwitchField };

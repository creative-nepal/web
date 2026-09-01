"use client";

import { Controller } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormField } from "./use-form-field";

interface RadioGroupFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupFieldProps {
  name: string;
  label?: string;
  description?: string;
  options: RadioGroupFieldOption[];
}

function RadioGroupField({
  name,
  label,
  description,
  options,
}: RadioGroupFieldProps) {
  const { control, error } = useFormField(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FieldSet data-invalid={Boolean(error)}>
          {label && <FieldLegend variant="label">{label}</FieldLegend>}
          <RadioGroup value={field.value} onValueChange={field.onChange}>
            {options.map((option) => (
              <Field key={option.value} orientation="horizontal">
                <RadioGroupItem
                  id={`${name}-${option.value}`}
                  value={option.value}
                  disabled={option.disabled}
                  aria-invalid={Boolean(error)}
                />
                <FieldLabel htmlFor={`${name}-${option.value}`}>
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          <FieldContent>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={error ? [error] : undefined} />
          </FieldContent>
        </FieldSet>
      )}
    />
  );
}

export type { RadioGroupFieldOption, RadioGroupFieldProps };
export { RadioGroupField };

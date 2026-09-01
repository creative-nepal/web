"use client";

import { Controller } from "react-hook-form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useFormField } from "./use-form-field";

interface ComboboxFieldOption {
  value: string;
  label: string;
}

interface ComboboxFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  emptyText?: string;
  options: ComboboxFieldOption[];
  onSearchChange?: (search: string) => void;
}

function ComboboxField({
  name,
  label,
  description,
  placeholder = "Select an option",
  emptyText = "No results found.",
  options,
  onSearchChange,
}: ComboboxFieldProps) {
  const { control, error } = useFormField(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={Boolean(error)}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <FieldContent>
            <Combobox
              items={options}
              value={
                options.find((option) => option.value === field.value) ?? null
              }
              onValueChange={(option) => field.onChange(option?.value ?? null)}
              onInputValueChange={onSearchChange}
            >
              <ComboboxInput
                id={name}
                aria-invalid={Boolean(error)}
                placeholder={placeholder}
                showClear
              />
              <ComboboxContent>
                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                <ComboboxList>
                  {(option: ComboboxFieldOption) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={error ? [error] : undefined} />
          </FieldContent>
        </Field>
      )}
    />
  );
}

export type { ComboboxFieldOption, ComboboxFieldProps };
export { ComboboxField };

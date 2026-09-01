"use client";

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import type * as React from "react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useFormField } from "./use-form-field";

interface PasswordFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "name" | "type"> {
  name: string;
  label?: string;
  description?: string;
}

function PasswordField({
  name,
  label,
  description,
  ...props
}: PasswordFieldProps) {
  const { control, error } = useFormField(name);
  const [visible, setVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={Boolean(error)}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <FieldContent>
            <InputGroup>
              <InputGroupInput
                id={name}
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                {...field}
                {...props}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Hide password" : "Show password"}
                >
                  {visible ? (
                    <RiEyeOffLine className="size-4" />
                  ) : (
                    <RiEyeLine className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={error ? [error] : undefined} />
          </FieldContent>
        </Field>
      )}
    />
  );
}

export type { PasswordFieldProps };
export { PasswordField };

"use client";

import { RiCalendarLine } from "@remixicon/react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useFormField } from "./use-form-field";

interface DateFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
}

function DateField({
  name,
  label,
  description,
  placeholder = "Pick a date",
}: DateFieldProps) {
  const { control, error } = useFormField(name);
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field data-invalid={Boolean(error)}>
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
          <FieldContent>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    id={name}
                    variant="outline"
                    aria-invalid={Boolean(error)}
                    className="w-full justify-start font-normal"
                  >
                    <RiCalendarLine className="size-4 text-muted-foreground" />
                    <span
                      className={cn(!field.value && "text-muted-foreground")}
                    >
                      {field.value ? formatDate(field.value) : placeholder}
                    </span>
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={error ? [error] : undefined} />
          </FieldContent>
        </Field>
      )}
    />
  );
}

export type { DateFieldProps };
export { DateField };

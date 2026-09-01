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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useFormField } from "./use-form-field";

interface DateTimeFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
}

function mergeDateAndTime(
  date: Date | undefined,
  time: string,
): Date | undefined {
  if (!date) {
    return undefined;
  }
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const merged = new Date(date);
  merged.setHours(hours, minutes, 0, 0);
  return merged;
}

function DateTimeField({
  name,
  label,
  description,
  placeholder = "Pick a date and time",
}: DateTimeFieldProps) {
  const { control, error } = useFormField(name);
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value: Date | undefined = field.value;
        const timeValue = value
          ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
          : "";

        return (
          <Field data-invalid={Boolean(error)}>
            {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
            <FieldContent>
              <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        id={name}
                        variant="outline"
                        aria-invalid={Boolean(error)}
                        className="flex-1 justify-start font-normal"
                      >
                        <RiCalendarLine className="size-4 text-muted-foreground" />
                        <span className={cn(!value && "text-muted-foreground")}>
                          {value ? formatDateTime(value) : placeholder}
                        </span>
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={value}
                      onSelect={(date) => {
                        field.onChange(
                          mergeDateAndTime(date, timeValue || "00:00"),
                        );
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  className="w-28"
                  value={timeValue}
                  onChange={(e) =>
                    field.onChange(mergeDateAndTime(value, e.target.value))
                  }
                  disabled={!value}
                />
              </div>
              {description && (
                <FieldDescription>{description}</FieldDescription>
              )}
              <FieldError errors={error ? [error] : undefined} />
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}

export type { DateTimeFieldProps };
export { DateTimeField };

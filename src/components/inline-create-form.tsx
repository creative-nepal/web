"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface InlineField {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  width?: string;
}

interface InlineCreateFormProps {
  fields: InlineField[];
  submitLabel: string;
  onSubmit: () => void;
  isPending?: boolean;
  canSubmit?: boolean;
}

export function InlineCreateForm({
  fields,
  submitLabel,
  onSubmit,
  isPending = false,
  canSubmit = true,
}: InlineCreateFormProps) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      {fields.map((field) => (
        <Input
          key={field.placeholder}
          type={field.type}
          value={field.value}
          onChange={(event) => field.onChange(event.target.value)}
          placeholder={field.placeholder}
          className={field.width ?? "max-w-48"}
        />
      ))}
      <Button disabled={!canSubmit || isPending} onClick={onSubmit}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}

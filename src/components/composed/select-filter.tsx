"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFilterOption {
  value: string;
  label: string;
}

interface SelectFilterOptionGroup {
  label: string;
  options: SelectFilterOption[];
}

type SelectFilterEntry = SelectFilterOption | SelectFilterOptionGroup;

interface SelectFilterProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: SelectFilterEntry[];
  allLabel?: string;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

const ALL_VALUE = "__all__";

function isGroup(entry: SelectFilterEntry): entry is SelectFilterOptionGroup {
  return "options" in entry;
}

function flatten(entries: SelectFilterEntry[]): SelectFilterOption[] {
  return entries.flatMap((entry) => (isGroup(entry) ? entry.options : entry));
}

function SelectFilter({
  value,
  onValueChange,
  options,
  allLabel,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: SelectFilterProps) {
  const flatItems = flatten(options);
  const items = allLabel
    ? [{ value: ALL_VALUE, label: allLabel }, ...flatItems]
    : flatItems;

  return (
    <Select
      value={value ?? ALL_VALUE}
      onValueChange={(next) => onValueChange(next === ALL_VALUE ? null : next)}
      items={items}
    >
      <SelectTrigger className={className} aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>}
        {options.map((entry) =>
          isGroup(entry) ? (
            <SelectGroup key={entry.label}>
              <SelectLabel>{entry.label}</SelectLabel>
              {entry.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : (
            <SelectItem key={entry.value} value={entry.value}>
              {entry.label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}

export type {
  SelectFilterEntry,
  SelectFilterOption,
  SelectFilterOptionGroup,
  SelectFilterProps,
};
export { SelectFilter };

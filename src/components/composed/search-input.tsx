"use client";

import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  endAddon?: ReactNode;
}

/**
 * `value`/`onValueChange` reflect the debounced (committed) search term — e.g. the nuqs-backed
 * URL state a caller feeds into a server query. Typing updates the visible input immediately;
 * `onValueChange` only fires `debounceMs` after the user stops typing.
 */
function SearchInput({
  value,
  onValueChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
  endAddon,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debouncedOnValueChange = useDebouncedCallback(
    onValueChange,
    debounceMs,
  );

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function handleChange(next: string) {
    setDraft(next);
    debouncedOnValueChange(next);
  }

  function handleClear() {
    setDraft("");
    debouncedOnValueChange.cancel();
    onValueChange("");
  }

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <RiSearchLine className="size-4 text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        value={draft}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />
      {endAddon && (
        <InputGroupAddon align="inline-end">{endAddon}</InputGroupAddon>
      )}
      {draft && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <RiCloseLine className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export type { SearchInputProps };
export { SearchInput };

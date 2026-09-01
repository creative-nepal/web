"use client";

import { RiTranslate2 } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "../hooks/use-translation";

export function LanguageSwitcher() {
  const router = useRouter();
  const { language, setLanguage, languages } = useTranslation();

  if (languages.length < 2) {
    return null;
  }

  const current = languages.find((option) => option.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-2">
            <RiTranslate2 className="size-4" />
            <span>{current?.label ?? language}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {languages.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => {
              setLanguage(option.code);
              router.refresh();
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

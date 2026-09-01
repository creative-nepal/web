"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ContentNavLink } from "@/features/content/types";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { authClient } from "@/lib/auth-client";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SiteHeader({ links = [] }: { links?: ContentNavLink[] }) {
  const { t } = useTranslation();

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-semibold">
          {t("ui.brand.name")}
        </Link>
        <nav className="hidden items-center gap-4 sm:flex">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.id}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground"
                rel="noreferrer noopener"
                target="_blank"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {isPending ? null : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="size-8">
                <AvatarFallback>{initials(session.user.name)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {session.user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  {t("ui.action.signOut")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            {t("ui.auth.signInTitle")}
          </Button>
        )}
      </div>
    </header>
  );
}

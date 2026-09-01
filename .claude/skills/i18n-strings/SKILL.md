---
name: i18n-strings
description: >
  Render user-visible text in creative-nepal-web through the i18n catalogue instead of
  hardcoding it — useTranslation() in client components, getTranslations() in Server Components,
  and `t`-factories for module-scope data. Use when adding any label, button, toast, error or
  empty-state text, when a screen shows raw keys, or when adding a new translation key.
---

# No user-visible string is hardcoded in a component

Catalogues are **not** in this repo: they are served by `creative-nepal-api` at
`GET /api/v1/i18n/:lang`. Keys for the public site live under `ui.web.*`. Adding a key means editing
`src/i18n/en/ui.json` **and** `src/i18n/ne/ui.json` in the api repo — see its
`i18n-catalogue` skill. No release here is needed once the key exists.

Always look for an existing key first (`ui.action.*`, `ui.brand.*`, shared vocabulary) before
adding a new one.

## The three call sites

**Client components** — `"use client"`:

```ts
import { useTranslation } from "@/features/i18n/hooks/use-translation";

const { t } = useTranslation();
t("ui.web.pricing.title");
t("ui.web.content.updated", { slug });   // {slug} interpolates
```

**Server Components and route handlers**:

```ts
import { getTranslations } from "@/features/i18n/server";

const { t, locale } = await getTranslations();
```

It resolves the locale from the `creative-nepal-language` cookie (`localStorage` is invisible to
the server) and caches the catalogue fetch under the `i18n` tag.

**Module scope** — column definitions, select options, nav items and other data declared outside
a component cannot call a hook. Export a **factory taking `t`** and memoize at the call site:

```ts
export function planColumns(t: Translate): ColumnDef<...>[] { ... }

// in the view
const columns = useMemo(() => planColumns(t), [t]);
```

Same for `sectorOptions(t)` and friends. `Translate` comes from `@/features/i18n/types`.

## Why the root layout matters

`src/app/layout.tsx` fetches the catalogue on the server and hands it to `Providers`, which
seeds the client query and the first-render locale. Without that seed every client component
paints raw keys until the catalogue request resolves — if you see keys flash on screen, check
that path before anything else.

## Checklist

- [ ] Key added to **both** `en/ui.json` and `ne/ui.json` in `../api` (they must stay
      key-for-key identical; `bun .claude/skills/i18n-catalogue/scripts/check-parity.mjs` there)
- [ ] Namespaced `ui.web.*`
- [ ] No literal string left in JSX, no literal in a `toast`, `aria-label`, `placeholder`,
      `title` or thrown message
- [ ] Module-scope data goes through a `t` factory, wrapped in `useMemo`
- [ ] `bun run check-types && bun run lint`

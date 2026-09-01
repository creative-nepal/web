@AGENTS.md

# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

`creative-nepal-web` — the public-facing Next.js 16 (App Router) site, port 3000. Standalone repo,
extracted from a Turborepo monorepo. Siblings: `creative-nepal-api` (backend, port 3333) and
`creative-nepal-admin` (dashboard, port 3001). No workspace or package dependency on either — they
are coupled only over HTTP and by the shared contracts listed at the bottom.

All three are checked out side by side under `creativenepal-platform/` as `api/`, `web/` and
`admin/`. Each is an independent git repository; the parent folder is convenience only.

## Commands

Package manager is **bun** (bun 1.3.14, `bun.lock` present — do not use npm/yarn/pnpm). CLI
generators (`shadcn`) must be invoked via **`bunx`, never `npx`**.

```sh
bun run dev            # next dev, http://localhost:3000
bun run build          # next build
bun run start          # next start
bun run lint           # biome check
bun run format         # biome format --write
bun run check-types    # next typegen && tsc --noEmit
```

Requires `creative-nepal-api` running on `NEXT_PUBLIC_API_URL` (see `.env.example`).

## Design system lives here, and is duplicated

`src/components/ui/` (raw shadcn primitives), `src/components/form/` (RHF+Zod field components)
and `src/components/composed/` (DataTable, DashboardShell, ConfirmDialog, …) used to be a shared
`@repo/ui` workspace package. They are now a **copy**, byte-identical to the copy in
`creative-nepal-admin`. Same for `src/hooks/`, `src/lib/utils.ts`, `src/lib/formatters/`,
`src/lib/api-client/` and `src/styles/globals.css`.

**A change to any of those paths must be mirrored into the admin repo.** Use the helper:

```sh
./scripts/sync-ui.sh diff    # show drift against ../admin (exit 1 if any)
./scripts/sync-ui.sh push    # overwrite the admin copy from this one
./scripts/sync-ui.sh pull    # overwrite this copy from admin's
```

Nothing enforces this in CI — the two repos are never checked out together. Run `diff` before
opening a PR that touches those paths.

- New shadcn primitives: `bunx shadcn@latest add <name>` from this repo root (`components.json`
  aliases resolve to `@/components/*`), then `./scripts/sync-ui.sh push`.
- `src/components/ui/` has relaxed Biome rules (the `overrides` block in `biome.json`) since it is
  vendor-managed and shouldn't diverge from upstream just to satisfy house lint rules.
- `DataTable` is **always server-driven** — sorting/filtering/pagination are required controlled
  props (`manualSorting`/`manualFiltering`/`manualPagination` are hardcoded `true`); it never
  re-sorts or re-paginates client-side. Built on TanStack Table **v9**'s real pluggable-feature API
  (`useTable({ features, ... })`, `table.FlexRender`) — not the v8-style
  `useReactTable`/`getCoreRowModel` API, and not the `/legacy` compat shim.
- `<Form schema={zodSchema}>` owns the React Hook Form context; every `*Field` reads it via a
  shared `useFormField` hook — never wire RHF directly in app code. Dynamic lists do need RHF's
  array helpers, so `src/components/form/form.tsx` re-exports
  `useFieldArray`/`useFormContext`/`useWatch`; import them from `@/components/form/form`, never
  from `react-hook-form` directly.

## Marketing routes are data, not code

Every public marketing route is served by the single catch-all `src/app/(marketing)/[[...slug]]/page.tsx`,
rendered on the server from the CMS. **Do not add hand-written marketing pages alongside it.**

- Content is read **only** in Server Components / route handlers (`src/features/content/services.ts`).
  Locale comes from the `creative-nepal-language` cookie the language switcher mirrors out of the
  zustand store, since `localStorage` is invisible to the server. A missing translation falls back
  to `en` per page.
- Content fetches are tagged `content` and revalidate every 5 minutes. After any CMS write the API
  pings `WEB_REVALIDATE_URL` and the route handler here calls `revalidateTag("content", "max")`, so
  a publish reaches visitors without waiting out the window.
- Draft preview: admin links to its own `/api/preview`, which attaches `CONTENT_PREVIEW_SECRET`
  server-side and redirects here; `/api/preview` enables Next draft mode, and the page then sends
  the secret as `x-preview-secret` so the API includes drafts. The secret is never exposed to the
  browser.

## Internationalization

Catalogues are served by the API (`GET /api/v1/i18n/:lang`), not stored here. **No user-visible
string is hardcoded in a component.**

- Client components: `const { t } = useTranslation()` (`features/i18n/hooks/use-translation`), then
  `t("ui.web.pricing.title")`. Placeholders interpolate: `t("ui.web.content.updated", { slug })`.
- Server Components and route handlers: `const { t, locale } = await getTranslations()`
  (`features/i18n/server`). It resolves the locale from the `creative-nepal-language` cookie and
  caches the catalogue fetch under the `i18n` tag.
- The root layout fetches the catalogue on the server and hands it to `Providers`, which seeds the
  client query and the first-render locale. Without that, every client component would paint raw
  keys until the catalogue request resolved.
- Module-scope data (DataTable column definitions, select options, nav items) cannot call a hook,
  so those files export factories taking `t` — `planColumns(t)`, `sectorOptions(t)`. Views wrap
  them in `useMemo(() => planColumns(t), [t])`.
- Adding a string means adding the key to `en/ui.json` **and** `ne/ui.json` in `creative-nepal-api`.

## Cross-repo contracts

- **CMS block contract** — adding a block type means changing three repos in order:
  `creative-nepal-api` (`src/database/schema/content.ts` + `src/modules/content/content.schema.ts`),
  then here (`src/features/content/types` + `components/block-renderer.tsx` — the renderer registry,
  whose exhaustive `switch` makes a missing renderer a type error), then `creative-nepal-admin`
  (`src/features/content/types` + `schemas.ts`).
- **i18n keys** — live in `creative-nepal-api`; adding one needs no release here.
- **Shared secrets** — `CONTENT_PREVIEW_SECRET` and `WEB_REVALIDATE_SECRET` must match the API's.

## Skills

Task procedures live in `.claude/skills/` and load on demand — this file stays the always-on
facts. Available here:

- `feature-module` — the `src/features/<name>/` slice: services, queries, mutations, views.
- `shared-ui-change` — mirroring the duplicated design system into `../admin` with
  `scripts/sync-ui.sh`.
- `i18n-strings` — `useTranslation()` / `getTranslations()` / `t`-factories, and where keys live.
- `cms-block-renderer` — the marketing catch-all, block renderers, preview and revalidation.

### Installed from the registry

Third-party skills are vendored under `.agents/skills/<name>/` with a symlink from
`.claude/skills/<name>/` — both are committed, so a fresh checkout gets them. Manage with the
skills CLI, and note **`npx` fails inside this repo** (`devEngines.packageManager` pins bun):

```sh
bunx skills add <owner/repo@skill> -y   # install
bunx skills update                      # update everything installed here
```

- `vercel-react-best-practices` (vercel-labs/agent-skills, 678K installs) — React/Next
  performance rules from Vercel.
- `shadcn` (shadcn/ui, 272K installs) — the shadcn CLI/registry workflow, matching
  `components.json` here. Remember `bunx`, never `npx`, and `./scripts/sync-ui.sh push` after.
- `frontend-design` (anthropics/skills, 838K installs) — visual/UI design guidance.
- `code-review` and `diagnosing-bugs` (mattpocock/skills, 451K / 509K installs) — a two-axis
  diff review and a debugging loop. Claude Code already ships a built-in `/code-review`, so this
  one is listed scoped as `<repo>:code-review` — pick that one for files in this repo.

**These predate Next.js 16.** Where third-party React/Next guidance disagrees with `AGENTS.md`,
`node_modules/next/dist/docs/` or the repo skills above, the repo wins.

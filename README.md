# creative-nepal-web

Public-facing marketing site and storefront. Next.js 16 (App Router), React 19, Tailwind v4.

Part of a three-repo system, checked out side by side:

| Repo | Role | Port |
| --- | --- | --- |
| [`creative-nepal-api`](../api) | NestJS backend, Postgres, Better Auth, CMS | 3333 |
| **`creative-nepal-web`** (this repo) | public site | 3000 |
| [`creative-nepal-admin`](../admin) | internal dashboard | 3001 |

```
creativenepal-platform/
  api/      NestJS backend
  web/      public site
  admin/    internal dashboard
```

Each is an independent git repository; the parent folder is just for convenience.

## Getting started

Requires [bun](https://bun.sh) 1.3.14 and a running `creative-nepal-api`.

```sh
bun install
cp .env.example .env
bun run dev          # http://localhost:3000
```

## Scripts

```sh
bun run dev            # dev server
bun run build          # production build
bun run start          # serve the production build
bun run lint           # biome check
bun run format         # biome format --write
bun run check-types    # next typegen && tsc --noEmit
```

## Layout

```
src/
  app/                    routes; (marketing)/[[...slug]] is the CMS catch-all
  features/               feature folders (queries, mutations, views)
  components/
    ui/ form/ composed/   design system — DUPLICATED, see below
  hooks/  lib/  styles/   also duplicated
  providers/ stores/ types/
scripts/sync-ui.sh        keeps the duplicated paths aligned with the admin repo
```

## The design system is duplicated

`src/components/{ui,form,composed}`, `src/hooks`, `src/lib/utils.ts`, `src/lib/formatters`,
`src/lib/api-client` and `src/styles/globals.css` are a byte-identical copy of the same paths in
`creative-nepal-admin`. Changing them here means mirroring them there:

```sh
./scripts/sync-ui.sh diff    # report drift (exit 1 if any)
./scripts/sync-ui.sh push    # copy this repo's version into the admin repo
./scripts/sync-ui.sh pull    # take the admin repo's version
```

CI cannot check this — the repos are never checked out together. Run `diff` before you open a PR
that touches those paths.

## Environment

See `.env.example`. `CONTENT_PREVIEW_SECRET` and `WEB_REVALIDATE_SECRET` must match the values set
in `creative-nepal-api`.

## Notes for contributors

`CLAUDE.md` documents the CMS rendering model, the i18n contract, and the design-system rules in
detail. Read it before adding a marketing page (you almost certainly should not — they are CMS
data, not code).

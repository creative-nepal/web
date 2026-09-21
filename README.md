# creative-nepal-web

Tenant workspace and marketing site. Next.js 16, React 19, Tailwind v4. Port 3000.

Part of a three-repo system with [`api`](../api) (3333) and [`admin`](../admin) (3001).

## Getting started

Requires [bun](https://bun.sh) 1.3.14 and a running API.

```sh
bun install
cp .env.example .env
bun run dev
```

## Scripts

```sh
bun run dev            # dev server
bun run build          # production build
bun run start          # serve the build
bun run lint           # biome check
bun run format         # biome format --write
bun run check-types    # next typegen && tsc --noEmit
```

## Layout

```
src/
  app/                    routes; (marketing)/[[...slug]] renders CMS pages
  features/               feature folders
  components/ui|form|composed, hooks/, lib/, styles/   shared with admin
  providers/ stores/ types/
scripts/sync-ui.sh        keeps shared paths in sync with admin
```

## Shared design system

The shared paths must stay identical to `admin`. After changing them:

```sh
./scripts/sync-ui.sh diff    # show drift
./scripts/sync-ui.sh push    # copy to admin
./scripts/sync-ui.sh pull    # copy from admin
```

## Notes

- `CONTENT_PREVIEW_SECRET` and `WEB_REVALIDATE_SECRET` must match the API.
- Marketing pages are CMS data, not code. See `CLAUDE.md`.

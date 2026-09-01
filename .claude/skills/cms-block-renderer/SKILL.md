---
name: cms-block-renderer
description: >
  Render CMS content in creative-nepal-web — add a renderer for a new block type, change an
  existing block's markup, or work on the marketing catch-all route, draft preview and
  revalidation. Use when a marketing page needs new content, when a block type was added in
  creative-nepal-api, or when someone is about to hand-write a marketing page.
---

# Marketing routes are data, not code

Every public marketing route is served by the single catch-all
`src/app/(marketing)/[[...slug]]/page.tsx`, rendered on the server from the CMS.
**Do not add a hand-written marketing page alongside it** — add the page in the admin dashboard,
or a block type if the shape does not exist yet.

- Content is read **only** in Server Components / route handlers
  (`src/features/content/services.ts`). Locale comes from the `creative-nepal-language` cookie
  the language switcher mirrors out of the zustand store — `localStorage` is invisible to the
  server. A missing translation falls back to `en` per page.
- Fetches are tagged `content` and revalidate every 5 minutes. After a CMS write the API pings
  `WEB_REVALIDATE_URL` and the route handler here calls `revalidateTag("content", "max")`, so a
  publish does not wait out the window. If publishes are not showing up, check
  `WEB_REVALIDATE_SECRET` matches the API's.
- Draft preview: admin links to its own `/api/preview`, which attaches `CONTENT_PREVIEW_SECRET`
  server-side and redirects here; `/api/preview` enables Next draft mode and the page then sends
  the secret as `x-preview-secret` so the API includes drafts. The secret never reaches the browser.

## Adding a renderer for a new block type

Order across repos is fixed — `creative-nepal-api` first, then here, then
`creative-nepal-admin`. Doing it in that order means the type is already valid server-side and
the compiler points at the gap here.

1. `src/features/content/types/index.ts` — add the `XBlock` interface (`id`, `type: "x"`, fields)
   and add it to the `ContentBlock` union. Mirror the API's Zod schema field for field: optional
   there is optional here.
2. `src/features/content/components/blocks/x-block.tsx` — a Server Component
   `export function XBlockView({ block }: { block: XBlock })`. No `"use client"` unless the block
   genuinely needs interactivity.
3. `src/features/content/components/block-renderer.tsx` — add the `case "x":` arm. The `default`
   arm assigns to `const exhaustive: never = block`, so a missing arm is a **type error**, not a
   blank section. Never widen that to silence it.
4. `bun run check-types` — the `never` assignment is what proves the registry is complete.

## Rules

- Block content is author-supplied data: render it as text/props. Never `dangerouslySetInnerHTML`
  a block field. Hrefs are already restricted server-side to site paths and
  `http(s)`/`mailto`/`tel` — do not re-derive a looser rule here.
- Block copy comes from the CMS, but chrome around it (labels, aria, empty states) is still
  i18n — see the `i18n-strings` skill.
- Blocks live in `src/features/content/components/blocks/`, not in `components/composed`
  (which is shared with admin — `shared-ui-change` skill).

## Verify

```sh
bun run check-types && bun run lint
bun run dev     # port 3000; API on NEXT_PUBLIC_API_URL, seed with `bun run db:seed:content` there
```

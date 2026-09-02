---
name: feature-module
description: >
  Build a feature slice in creative-nepal-web — src/features/<name>/ with services, queries,
  types, components and views, wired to a route under src/app/(workspace). Use when adding a
  workspace screen, a list, a form, a mutation, or any new call to creative-nepal-api from this
  repo.
---

# Feature slice layout

Reference implementations: `src/features/products/` (smallest: types + services + queries +
views) and `src/features/purchasing/` (full: constants, hooks, components with mutations).

```
src/features/<name>/
  types/index.ts     the API response shape and any input shapes
  services.ts        axios calls only — the only file that knows URLs
  queries.ts         `<name>QueryKeys` + `queryOptions` factories
  constants.ts       enums, option lists, tab ids
  hooks/             feature-local hooks
  components/        feature-local components (never in components/composed)
  views/<name>-view.tsx   the "use client" composition the route renders
```

Route files under `src/app/(workspace)/<name>/page.tsx` stay thin — they render the view.
Business logic does not live in `app/`.

## Rules

- **Never call `axios`/`fetch` from a component.** Components use
  `useQuery(<name>QueryOptions(...))`; only `services.ts` builds URLs
  (`api.get<PaginatedResult<T>>("/api/v1/...")` from `@/lib/api`).
- Query keys: each feature exports a `<name>QueryKeys` object from `queries.ts`
  (`all` + `list(...)`, see `features/products/queries.ts`). `src/lib/api-client/query-keys.ts`
  documents the canonical shape via `createQueryKeys` — match it. Key parts must be
  JSON-serializable: plain objects, strings, numbers, booleans — no Dates, class instances or
  functions. List queries set `placeholderData: (previous) => previous` so the table does not
  flash on refetch.
- Writes: `useMutation({ mutationFn: () => <service>(...), onSuccess })` in the component or
  view that owns the interaction, invalidating at the coarsest correct key
  (`queryClient.invalidateQueries({ queryKey: <name>QueryKeys.all })`) and reporting with
  `toast.success(t("..."))`. See `features/purchasing/components/purchase-orders-tab.tsx`.
- Business scoping: most services take a `businessId`; gate the query with
  `enabled: Boolean(businessId)` rather than firing a request with an empty id.
- Lists rendered with `DataTable` are **server-driven** — the API returns
  `{ data, total, limit, offset }`, so pass `data`/`rowCount` and own the
  `sorting`/`columnFilters`/`pagination` state in the view. It never re-sorts client-side.
- Column definitions and option lists are module scope and cannot call a hook, so export a
  **factory taking `t`** and wrap it in the view with `useMemo(() => planColumns(t), [t])`.
- Forms: `<Form schema={zodSchema}>` from `@/components/form/form` owns the RHF context; `*Field`
  components read it. Never call `useForm` in app code; import `useFieldArray`/`useFormContext`/
  `useWatch` from `@/components/form/form`, never from `react-hook-form`.
- **No hardcoded user-visible strings** — `i18n-strings` skill; keys are namespaced `ui.web.*`.
- Public marketing routes are **not** features: they are CMS data behind the catch-all
  `src/app/(marketing)/[[...slug]]/page.tsx`. Do not add a hand-written marketing page — see
  the `cms-block-renderer` skill.
- Anything under `src/components/{ui,form,composed}`, `src/hooks`,
  `src/lib/{utils.ts,formatters,api-client}` or `src/styles/globals.css` is shared byte-for-byte
  with the admin repo — `shared-ui-change` skill before editing there.

## Verify

```sh
bun run check-types      # next typegen && tsc --noEmit
bun run lint             # biome check
bun run dev              # port 3000; needs creative-nepal-api on NEXT_PUBLIC_API_URL
```

bun only — no npm/yarn/pnpm; generators via `bunx`.

## Navigation, permissions and sector labels come from the server

- The workspace sidebar renders whatever `GET /api/v1/businesses/:id/workspace` returns
  (`features/business/hooks/use-workspace`). There is no local nav list — a new screen gets its
  entry by adding a nav item to that sector's `meta.ts` in `creative-nepal-api`, with the
  permission it requires. Adding a route here without that entry gives a page nobody can reach.
- Gate UI on `usePermission({ invoice: ["print"] })`, which reads the effective permissions from
  that same response. **Never read `session.user.role`** — that is the *platform* admin role, a
  different axis from business membership; the old hook did, and defaulted to granting everything.
- Sector names come from `t(\`common.sector.${sector}\`)`, not a local label map.
- The active branch travels as an `X-Branch-Id` header added by `lib/api.ts` from the branch
  store. Feature services never pass it themselves; omitting it lets the API fall back to the
  business's default branch.

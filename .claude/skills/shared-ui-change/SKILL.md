---
name: shared-ui-change
description: >
  Mirror a design-system change into creative-nepal-admin, which keeps a byte-identical copy of
  src/components/ui, src/components/form, src/components/composed, src/hooks, src/lib/utils.ts,
  src/lib/formatters, src/lib/api-client and src/styles/globals.css. Use when editing anything under those
  paths, when adding a shadcn primitive with bunx shadcn, when a DataTable or Form component
  changes, or when checking the two repos for drift.
---

# The design system is duplicated, and nothing enforces it

These paths used to be a shared `@repo/ui` workspace package. They are now a **copy** that must
stay byte-identical with creative-nepal-admin:

```
src/components/ui        src/hooks              src/lib/api-client
src/components/form      src/lib/utils.ts       src/styles/globals.css
src/components/composed  src/lib/formatters
```

CI cannot catch drift — the two repos are never checked out together. `../admin` is the peer
checkout under `creativenepal-platform/`.

## Workflow

```sh
./scripts/sync-ui.sh diff    # drift against ../admin, exit 1 if any
./scripts/sync-ui.sh push    # overwrite the peer's copy from this one
./scripts/sync-ui.sh pull    # overwrite this copy from the peer's
```

1. `diff` **before** you start — if the tree is already drifted, resolve that first, or your
   `push` silently reverts the peer's work.
2. Make the change here.
3. `./scripts/sync-ui.sh push`, then run `bun run check-types` **in the peer repo too** —
   a prop you removed may be used only there.
4. `diff` again; it must exit 0 before the PR.

A change is only "done" when both repos build. The two PRs are separate but land together.

## Adding a shadcn primitive

```sh
bunx shadcn@latest add <name>     # bunx, never npx; from this repo root
./scripts/sync-ui.sh push
```

`components.json` aliases resolve to `@/components/*`. `src/components/ui/` has relaxed
Biome rules (the `overrides` block in `biome.json`) because it is vendor-managed — do not
reformat it to satisfy house lint rules, that is pure drift.

## Component rules that live in these paths

- **`DataTable` is always server-driven.** `manualSorting`/`manualFiltering`/`manualPagination`
  are hardcoded `true` and `sorting`/`columnFilters`/`pagination` + their `onChange` handlers
  and `rowCount` are required props. It never re-sorts or re-paginates `data` itself — if a table
  looks unsorted, fix the query, not the component. Built on TanStack Table **v9**'s pluggable
  feature API (`useTable({ features, ... })`, `table.FlexRender`) — not v8's
  `useReactTable`/`getCoreRowModel`, and not the `/legacy` shim.
- **`<Form schema={zodSchema}>` owns the RHF context.** Every `*Field` reads it through the
  shared `useFormField` hook; never wire React Hook Form directly in app code. Array helpers are
  re-exported from `src/components/form/form.tsx` — import `useFieldArray`/`useFormContext`/
  `useWatch` from `@/components/form/form`, never from `react-hook-form`.

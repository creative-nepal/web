/**
 * Hierarchical query-key factory helper (qk-factory-pattern). Each feature's
 * `queries.ts` builds one of these per entity so key shape stays consistent and
 * `invalidateQueries` targeting is predictable:
 *
 * ```ts
 * export const userKeys = createQueryKeys("users");
 * // userKeys.all           -> ["users"]
 * // userKeys.lists()       -> ["users", "list"]
 * // userKeys.list(filters) -> ["users", "list", filters]
 * // userKeys.details()     -> ["users", "detail"]
 * // userKeys.detail(id)    -> ["users", "detail", id]
 * ```
 *
 * `filters`/`id` must be JSON-serializable (qk-serializable) — plain objects, strings,
 * numbers, booleans, not class instances, Dates, or functions.
 */
export function createQueryKeys<TEntity extends string>(entity: TEntity) {
  return {
    all: [entity] as const,
    lists: () => [entity, "list"] as const,
    list: <TFilters>(filters: TFilters) => [entity, "list", filters] as const,
    details: () => [entity, "detail"] as const,
    detail: <TId>(id: TId) => [entity, "detail", id] as const,
  };
}

export function createQueryKeys<TEntity extends string>(entity: TEntity) {
  return {
    all: [entity] as const,
    lists: () => [entity, "list"] as const,
    list: <TFilters>(filters: TFilters) => [entity, "list", filters] as const,
    details: () => [entity, "detail"] as const,
    detail: <TId>(id: TId) => [entity, "detail", id] as const,
  };
}

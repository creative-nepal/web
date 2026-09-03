import { queryOptions } from "@tanstack/react-query";
import { KITCHEN_POLL_INTERVAL_MS } from "./constants";
import { getRecipe, listMenu, listTables, listTickets } from "./services";

export const restaurantQueryKeys = {
  all: ["restaurant"] as const,
  tables: (businessId: string) =>
    [...restaurantQueryKeys.all, "tables", businessId] as const,
  menu: (businessId: string) =>
    [...restaurantQueryKeys.all, "menu", businessId] as const,
  tickets: (businessId: string, openOnly: boolean) =>
    [...restaurantQueryKeys.all, "tickets", businessId, openOnly] as const,
  recipe: (businessId: string, menuItemId: string) =>
    [...restaurantQueryKeys.all, "recipe", businessId, menuItemId] as const,
};

export function tablesQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: restaurantQueryKeys.tables(businessId),
    queryFn: () => listTables(businessId),
    enabled: Boolean(businessId),
  });
}

export function menuQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: restaurantQueryKeys.menu(businessId),
    queryFn: () => listMenu(businessId),
    enabled: Boolean(businessId),
  });
}

export function ticketsQueryOptions(businessId: string, openOnly = true) {
  return queryOptions({
    queryKey: restaurantQueryKeys.tickets(businessId, openOnly),
    queryFn: () => listTickets(businessId, { openOnly }),
    enabled: Boolean(businessId),
    refetchInterval: KITCHEN_POLL_INTERVAL_MS,
  });
}

export function recipeQueryOptions(businessId: string, menuItemId: string) {
  return queryOptions({
    queryKey: restaurantQueryKeys.recipe(businessId, menuItemId),
    queryFn: () => getRecipe(businessId, menuItemId),
    enabled: Boolean(businessId && menuItemId),
  });
}

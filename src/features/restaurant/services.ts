import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";

export interface RestaurantTable {
  id: string;
  tableNo: string;
  seats: number;
  status: "empty" | "occupied" | "billed";
  assignedWaiterId: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  isAvailable: boolean;
  station: string;
  modifiers: Array<{
    name: string;
    options: Array<{ label: string; priceDeltaCents: number }>;
  }>;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  tableId: string | null;
  station: string;
  status: "in_kitchen" | "preparing" | "ready" | "served";
  createdAt: string;
  items: Array<{
    orderItemId: string;
    name: string;
    quantity: number;
    modifiers: Array<{ name: string; label: string }>;
    status: string;
  }>;
}

export async function listTables(
  businessId: string,
): Promise<RestaurantTable[]> {
  const { data } = await api.get<PaginatedResult<RestaurantTable>>(
    `/api/v1/businesses/${businessId}/tables`,
    { params: { limit: 100 } },
  );
  return data.data;
}

export async function createTable(
  businessId: string,
  input: { tableNo: string; seats?: number },
): Promise<RestaurantTable> {
  const { data } = await api.post<RestaurantTable>(
    `/api/v1/businesses/${businessId}/tables`,
    input,
  );
  return data;
}

export async function listMenu(businessId: string): Promise<MenuItem[]> {
  const { data } = await api.get<PaginatedResult<MenuItem>>(
    `/api/v1/businesses/${businessId}/menu`,
    { params: { limit: 200 } },
  );
  return data.data;
}

export async function createMenuItem(
  businessId: string,
  input: {
    name: string;
    category: string;
    priceCents: number;
    station?: string;
  },
): Promise<MenuItem> {
  const { data } = await api.post<MenuItem>(
    `/api/v1/businesses/${businessId}/menu`,
    input,
  );
  return data;
}

export async function setAvailability(
  businessId: string,
  menuItemId: string,
  isAvailable: boolean,
): Promise<MenuItem> {
  const { data } = await api.patch<MenuItem>(
    `/api/v1/businesses/${businessId}/menu/${menuItemId}/availability`,
    { isAvailable },
  );
  return data;
}

export async function listTickets(
  businessId: string,
  params: { status?: string; station?: string; openOnly?: boolean } = {},
): Promise<KitchenTicket[]> {
  const { data } = await api.get<KitchenTicket[]>(
    `/api/v1/businesses/${businessId}/kitchen/tickets`,
    { params },
  );
  return data;
}

export async function advanceTicket(
  businessId: string,
  ticketId: string,
  status: string,
): Promise<{ id: string; status: string }> {
  const { data } = await api.patch<{ id: string; status: string }>(
    `/api/v1/businesses/${businessId}/kitchen/tickets/${ticketId}/status`,
    { status },
  );
  return data;
}

export async function billTable(
  businessId: string,
  tableId: string,
): Promise<unknown[]> {
  const { data } = await api.post<unknown[]>(
    `/api/v1/businesses/${businessId}/tables/${tableId}/bill`,
    {},
  );
  return data;
}

export async function closeTable(
  businessId: string,
  tableId: string,
): Promise<void> {
  await api.post(
    `/api/v1/businesses/${businessId}/tables/${tableId}/close`,
    {},
  );
}

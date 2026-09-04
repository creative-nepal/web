import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";

export interface RestaurantTable {
  id: string;
  tableNo: string;
  seats: number;
  status: "empty" | "occupied" | "billed";
  assignedWaiterId: string | null;
  areaId: string | null;
}

export interface TableArea {
  id: string;
  branchId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  tableCount: number;
}

export type BillSplitMode = "items" | "equal" | "percentage";

export interface BillTableInput {
  mode?: BillSplitMode;
  splits?: Array<{ orderItemIds: string[] }>;
  ways?: number;
  percentages?: number[];
}

export interface TableMoveResult {
  tableId: string;
  tableNo: string;
  ordersMoved: number;
  fromTableNos: string[];
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
    note: string | null;
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
  input: { tableNo: string; seats?: number; areaId?: string },
): Promise<RestaurantTable> {
  const { data } = await api.post<RestaurantTable>(
    `/api/v1/businesses/${businessId}/tables`,
    input,
  );
  return data;
}

export async function updateTable(
  businessId: string,
  tableId: string,
  input: { tableNo?: string; seats?: number; areaId?: string | null },
): Promise<RestaurantTable> {
  const { data } = await api.patch<RestaurantTable>(
    `/api/v1/businesses/${businessId}/tables/${tableId}`,
    input,
  );
  return data;
}

export async function listTableAreas(businessId: string): Promise<TableArea[]> {
  const { data } = await api.get<PaginatedResult<TableArea>>(
    `/api/v1/businesses/${businessId}/table-areas`,
    { params: { limit: 100 } },
  );
  return data.data;
}

export async function createTableArea(
  businessId: string,
  input: { name: string; sortOrder?: number },
): Promise<TableArea> {
  const { data } = await api.post<TableArea>(
    `/api/v1/businesses/${businessId}/table-areas`,
    input,
  );
  return data;
}

export async function updateTableArea(
  businessId: string,
  areaId: string,
  input: { name?: string; sortOrder?: number; isActive?: boolean },
): Promise<TableArea> {
  const { data } = await api.patch<TableArea>(
    `/api/v1/businesses/${businessId}/table-areas/${areaId}`,
    input,
  );
  return data;
}

export async function deleteTableArea(
  businessId: string,
  areaId: string,
): Promise<void> {
  await api.delete(`/api/v1/businesses/${businessId}/table-areas/${areaId}`);
}

export async function transferTable(
  businessId: string,
  tableId: string,
  toTableId: string,
): Promise<TableMoveResult> {
  const { data } = await api.post<TableMoveResult>(
    `/api/v1/businesses/${businessId}/tables/${tableId}/transfer`,
    { toTableId },
  );
  return data;
}

export async function mergeTables(
  businessId: string,
  targetTableId: string,
  sourceTableIds: string[],
): Promise<TableMoveResult> {
  const { data } = await api.post<TableMoveResult>(
    `/api/v1/businesses/${businessId}/tables/${targetTableId}/merge`,
    { sourceTableIds },
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

export interface RecipeLine {
  productId: string;
  productName: string;
  quantity: string;
  unitType: string;
}

export async function getRecipe(
  businessId: string,
  menuItemId: string,
): Promise<RecipeLine[]> {
  const { data } = await api.get<RecipeLine[]>(
    `/api/v1/businesses/${businessId}/menu/${menuItemId}/recipe`,
  );
  return data;
}

export async function setRecipe(
  businessId: string,
  menuItemId: string,
  lines: Array<{ productId: string; quantity: number }>,
): Promise<RecipeLine[]> {
  const { data } = await api.put<RecipeLine[]>(
    `/api/v1/businesses/${businessId}/menu/${menuItemId}/recipe`,
    { lines },
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
  input: BillTableInput = {},
): Promise<unknown[]> {
  const { data } = await api.post<unknown[]>(
    `/api/v1/businesses/${businessId}/tables/${tableId}/bill`,
    input,
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

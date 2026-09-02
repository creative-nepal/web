import { queryOptions } from "@tanstack/react-query";
import {
  getPurchaseOrder,
  listBills,
  listDebitNotes,
  listPurchaseOrders,
  listSuppliers,
} from "./services";

export const purchasingQueryKeys = {
  all: ["purchasing"] as const,
  suppliers: (businessId: string) =>
    [...purchasingQueryKeys.all, "suppliers", businessId] as const,
  orders: (businessId: string) =>
    [...purchasingQueryKeys.all, "orders", businessId] as const,
  order: (businessId: string, poId: string) =>
    [...purchasingQueryKeys.all, "order", businessId, poId] as const,
  bills: (businessId: string) =>
    [...purchasingQueryKeys.all, "bills", businessId] as const,
  debitNotes: (businessId: string) =>
    [...purchasingQueryKeys.all, "debit-notes", businessId] as const,
};

export function suppliersQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: purchasingQueryKeys.suppliers(businessId),
    queryFn: () => listSuppliers(businessId),
    enabled: Boolean(businessId),
  });
}

export function purchaseOrdersQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: purchasingQueryKeys.orders(businessId),
    queryFn: () => listPurchaseOrders(businessId),
    enabled: Boolean(businessId),
  });
}

export function purchaseOrderQueryOptions(businessId: string, poId: string) {
  return queryOptions({
    queryKey: purchasingQueryKeys.order(businessId, poId),
    queryFn: () => getPurchaseOrder(businessId, poId),
    enabled: Boolean(businessId && poId),
  });
}

export function billsQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: purchasingQueryKeys.bills(businessId),
    queryFn: () => listBills(businessId),
    enabled: Boolean(businessId),
  });
}

export function debitNotesQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: purchasingQueryKeys.debitNotes(businessId),
    queryFn: () => listDebitNotes(businessId),
    enabled: Boolean(businessId),
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { suppliersQueryOptions } from "../queries";

export function useSupplierNames(businessId: string) {
  const { data: suppliers } = useQuery(suppliersQueryOptions(businessId));

  return useMemo(() => {
    const byId = new Map((suppliers?.data ?? []).map((s) => [s.id, s.name]));
    return (supplierId: string) => byId.get(supplierId) ?? "—";
  }, [suppliers]);
}

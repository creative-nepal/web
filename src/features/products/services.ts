import { api } from "@/lib/api";
import type { PaginatedResult } from "@/types/api";
import type { Product } from "./types";

export interface ListProductsParams {
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  lowStockOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function listProducts(
  businessId: string,
  params: ListProductsParams = {},
): Promise<PaginatedResult<Product>> {
  const { data } = await api.get<PaginatedResult<Product>>(
    `/api/v1/businesses/${businessId}/products`,
    {
      params: {
        isActive: true,
        limit: 50,
        sortBy: "name",
        sortDirection: "asc",
        ...params,
        search: params.search || undefined,
      },
    },
  );
  return data;
}

export async function getProduct(
  businessId: string,
  productId: string,
): Promise<Product> {
  const { data } = await api.get<Product>(
    `/api/v1/businesses/${businessId}/products/${productId}`,
  );
  return data;
}

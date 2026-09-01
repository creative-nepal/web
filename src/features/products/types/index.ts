export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string | null;
  unitType: string;
  priceCents: number;
  stockQty: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isActive: boolean;
  sectorData: {
    schedule?: string;
    genericName?: string;
    [key: string]: unknown;
  };
}

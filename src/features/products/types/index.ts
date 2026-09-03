export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string | null;
  unitType: string;
  unitsPerPack: number;
  subUnitLabel: string | null;
  subUnitPriceCents: number;
  priceCents: number;
  stockQty: number;
  stockPacks: number;
  stockLooseUnits: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isActive: boolean;
  sectorData: {
    schedule?: string;
    genericName?: string;
    [key: string]: unknown;
  };
}

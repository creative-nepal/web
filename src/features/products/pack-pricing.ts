import type { Product } from "./types";

export function lineTotalCents(product: Product, subUnits: number): number {
  if (product.unitsPerPack <= 1) {
    return Math.round(product.priceCents * subUnits);
  }

  return Math.round((product.priceCents * subUnits) / product.unitsPerPack);
}

export function isPacked(product: Product): boolean {
  return product.unitsPerPack > 1;
}

export function unitLabel(product: Product): string {
  return product.subUnitLabel ?? product.unitType;
}

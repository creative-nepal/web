"use client";

import { useCallback, useMemo, useState } from "react";
import type { Product } from "@/features/products/types";
import type { CartLine } from "../types";

export const BUYER_PAN_REQUIRED_ABOVE_CENTS = 1_000_000;

export function useCart(vatRegistered: boolean, serviceChargePercent = 0) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback((product: Product) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);

      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.product.id !== productId)
        : current.map((line) =>
            line.product.id === productId ? { ...line, quantity } : line,
          ),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => {
    const subtotalCents = lines.reduce(
      (total, line) => total + line.product.priceCents * line.quantity,
      0,
    );
    const serviceChargeCents = Math.round(
      (subtotalCents * serviceChargePercent) / 100,
    );
    const vatCents = vatRegistered
      ? Math.round(((subtotalCents + serviceChargeCents) * 13) / 100)
      : 0;

    return {
      subtotalCents,
      serviceChargeCents,
      vatCents,
      totalCents: subtotalCents + serviceChargeCents + vatCents,
    };
  }, [lines, vatRegistered, serviceChargePercent]);

  const schedules = useMemo(
    () => new Set(lines.map((line) => line.product.sectorData?.schedule)),
    [lines],
  );

  return {
    lines,
    add,
    setQuantity,
    clear,
    totals,
    requiresBuyerPan:
      vatRegistered && totals.totalCents > BUYER_PAN_REQUIRED_ABOVE_CENTS,
    requiresPrescription:
      schedules.has("prescription") || schedules.has("controlled"),
    requiresBuyerIdentity: schedules.has("controlled"),
  };
}

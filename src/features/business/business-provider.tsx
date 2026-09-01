"use client";

import { useQuery } from "@tanstack/react-query";
import type * as React from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useBusinessStore } from "@/stores/business-store";
import { myBusinessesQueryOptions } from "./queries";
import type { Business } from "./types";

interface BusinessContextValue {
  businesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
  switchBusiness: (businessId: string) => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { data: businesses, isLoading } = useQuery(myBusinessesQueryOptions());
  const currentBusinessId = useBusinessStore(
    (state) => state.currentBusinessId,
  );
  const setCurrentBusinessId = useBusinessStore(
    (state) => state.setCurrentBusinessId,
  );

  const currentBusiness = useMemo(() => {
    if (!businesses || businesses.length === 0) {
      return null;
    }

    return (
      businesses.find((business) => business.id === currentBusinessId) ?? null
    );
  }, [businesses, currentBusinessId]);

  useEffect(() => {
    if (!businesses || businesses.length === 0) {
      return;
    }

    if (!currentBusiness) {
      setCurrentBusinessId(businesses[0].id);
    }
  }, [businesses, currentBusiness, setCurrentBusinessId]);

  const value = useMemo<BusinessContextValue>(
    () => ({
      businesses: businesses ?? [],
      currentBusiness,
      isLoading,
      switchBusiness: setCurrentBusinessId,
    }),
    [businesses, currentBusiness, isLoading, setCurrentBusinessId],
  );

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext(): BusinessContextValue {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error(
      "useBusinessContext must be used within a BusinessProvider",
    );
  }

  return context;
}

export function useCurrentBusiness(): Business | null {
  return useBusinessContext().currentBusiness;
}

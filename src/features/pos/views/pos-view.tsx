"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import {
  productQueryKeys,
  productsQueryOptions,
} from "@/features/products/queries";
import { CartPanel } from "../components/cart-panel";
import { ComplianceFields } from "../components/compliance-fields";
import { InvoiceReceipt } from "../components/invoice-receipt";
import { ProductGrid } from "../components/product-grid";
import { EMPTY_COMPLIANCE } from "../constants";
import { useCart } from "../hooks/use-cart";
import { checkout } from "../services";
import type { CheckoutResult, ComplianceState } from "../types";

export function PosView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [issued, setIssued] = useState<CheckoutResult | null>(null);
  const [compliance, setCompliance] =
    useState<ComplianceState>(EMPTY_COMPLIANCE);

  const cart = useCart(
    business?.vatRegistered ?? false,
    business?.serviceChargePercent ?? 0,
    business?.maxDiscountPercent ?? 0,
  );
  const { data: products, isFetching } = useQuery(
    productsQueryOptions(business?.id ?? "", search),
  );

  const submit = useMutation({
    mutationFn: () => {
      if (!business) throw new Error(t("ui.web.pos.noBusiness"));

      return checkout(business.id, {
        items: cart.lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
        ...(cart.discountPercent > 0 && {
          discountPercent: cart.discountPercent,
        }),
        ...(compliance.buyerName && {
          customer: {
            name: compliance.buyerName,
            panNumber: compliance.buyerPan || undefined,
          },
        }),
        ...(cart.requiresPrescription && {
          prescription: {
            doctorName: compliance.doctorName,
            patientName: compliance.patientName,
            attachmentFileId: compliance.prescriptionFileId ?? undefined,
          },
        }),
        ...(cart.requiresBuyerIdentity && {
          buyerIdentity: {
            idType: "citizenship",
            idNumber: compliance.idNumber,
          },
        }),
      });
    },
    onSuccess: (result) => {
      setIssued(result);
      cart.clear();
      setCompliance(EMPTY_COMPLIANCE);
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
    onError: (error) => {
      const message =
        (error as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? t("ui.web.pos.checkoutFailed");
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    },
  });

  if (!business) {
    return null;
  }

  const canSubmit =
    cart.lines.length > 0 &&
    !submit.isPending &&
    (!cart.requiresBuyerPan ||
      Boolean(compliance.buyerName && compliance.buyerPan)) &&
    (!cart.requiresPrescription ||
      Boolean(compliance.doctorName && compliance.patientName)) &&
    (!cart.requiresBuyerIdentity || Boolean(compliance.idNumber));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.pos.title")}
        description={`${business.legalName}${business.vatRegistered ? " · VAT registered" : ""}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder={t("ui.web.pos.searchPlaceholder")}
          />
          <ProductGrid
            products={products?.data ?? []}
            isLoading={isFetching}
            onSelect={cart.add}
          />
        </div>

        <CartPanel
          lines={cart.lines}
          totals={cart.totals}
          vatRegistered={business.vatRegistered}
          discountPercent={cart.discountPercent}
          maxDiscountPercent={cart.maxDiscountPercent}
          onDiscountPercentChange={cart.setDiscountPercent}
          onQuantityChange={cart.setQuantity}
          canSubmit={canSubmit}
          isSubmitting={submit.isPending}
          onSubmit={() => submit.mutate()}
        >
          <ComplianceFields
            businessId={business.id}
            value={compliance}
            onChange={(patch) =>
              setCompliance((current) => ({ ...current, ...patch }))
            }
            requiresBuyerPan={cart.requiresBuyerPan}
            requiresPrescription={cart.requiresPrescription}
            requiresBuyerIdentity={cart.requiresBuyerIdentity}
          />
        </CartPanel>
      </div>

      {issued?.invoice && (
        <InvoiceReceipt
          businessId={business.id}
          invoice={issued.invoice}
          onDismiss={() => setIssued(null)}
        />
      )}
    </div>
  );
}

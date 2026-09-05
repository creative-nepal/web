"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { useCurrentBusiness } from "@/features/business/business-provider";
import {
  cashQueryKeys,
  currentSessionQueryOptions,
} from "@/features/cash/queries";
import type { PaymentMethod } from "@/features/cash/types";
import { channelsQueryOptions } from "@/features/channels/queries";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import {
  productQueryKeys,
  productsQueryOptions,
} from "@/features/products/queries";
import type { Product } from "@/features/products/types";
import { CartPanel } from "../components/cart-panel";
import { ChannelPicker } from "../components/channel-picker";
import { ComplianceFields } from "../components/compliance-fields";
import { InvoiceReceipt } from "../components/invoice-receipt";
import { PaymentPanel } from "../components/payment-panel";
import { ProductGrid } from "../components/product-grid";
import { SubstitutesDialog } from "../components/substitutes-dialog";
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
  const [substitutesFor, setSubstitutesFor] = useState<Product | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [compliance, setCompliance] =
    useState<ComplianceState>(EMPTY_COMPLIANCE);

  const cart = useCart(
    business?.vatRegistered ?? false,
    business?.serviceChargePercent ?? 0,
    business?.maxDiscountPercent ?? 0,
  );
  const { data: till } = useQuery(
    currentSessionQueryOptions(business?.id ?? ""),
  );
  const { data: channels } = useQuery(
    channelsQueryOptions(
      business?.sector === "restaurant" ? (business?.id ?? "") : "",
    ),
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
          ...(line.note ? { note: line.note } : {}),
        })),
        ...(cart.discountPercent > 0 && {
          discountPercent: cart.discountPercent,
        }),
        ...(channelId && { channelId, source: "delivery" as const }),
        ...(method && {
          payments: [
            {
              method,
              amountCents: cart.totals.totalCents,
              ...(reference ? { reference } : {}),
            },
          ],
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
      setChannelId(null);
      setMethod(null);
      setReference("");
      setCompliance(EMPTY_COMPLIANCE);
      void queryClient.invalidateQueries({ queryKey: cashQueryKeys.all });
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
        description={`${business.legalName}${
          business.vatRegistered
            ? ` · ${t("ui.web.settings.vatRegistered")}`
            : ""
        }`}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
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
            onFindSubstitutes={
              business.sector === "medical" ? setSubstitutesFor : undefined
            }
          />
        </div>

        <div className="lg:sticky lg:top-20">
          <CartPanel
            lines={cart.lines}
            totals={cart.totals}
            vatRegistered={business.vatRegistered}
            discountPercent={cart.discountPercent}
            maxDiscountPercent={cart.maxDiscountPercent}
            onDiscountPercentChange={cart.setDiscountPercent}
            onQuantityChange={cart.setQuantity}
            onNoteChange={cart.setNote}
            canSubmit={canSubmit}
            isSubmitting={submit.isPending}
            onSubmit={() => submit.mutate()}
          >
            <ChannelPicker
              channels={(channels?.data ?? []).filter(
                (channel) => channel.isActive,
              )}
              value={channelId}
              onChange={setChannelId}
            />

            <PaymentPanel
              totalCents={cart.totals.totalCents}
              method={method}
              onMethodChange={setMethod}
              reference={reference}
              onReferenceChange={setReference}
              tillOpen={Boolean(till)}
            />

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
      </div>

      <SubstitutesDialog
        businessId={business.id}
        product={substitutesFor}
        onOpenChange={(open) => !open && setSubstitutesFor(null)}
        onPick={cart.add}
      />

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

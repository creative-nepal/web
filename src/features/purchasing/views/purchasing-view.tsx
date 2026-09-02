"use client";

import { PageHeader } from "@/components/composed/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { DebitNotesTab } from "../components/debit-notes-tab";
import { PurchaseBillsTab } from "../components/purchase-bills-tab";
import { PurchaseOrdersTab } from "../components/purchase-orders-tab";
import { PurchaseReportsTab } from "../components/purchase-reports-tab";
import { SuppliersTab } from "../components/suppliers-tab";

export function PurchasingView() {
  const { t } = useTranslation();
  const tabs = [
    {
      value: "orders",
      label: t("ui.web.purchasing.ordersTab"),
      Component: PurchaseOrdersTab,
    },
    {
      value: "bills",
      label: t("ui.web.purchasing.billsTab"),
      Component: PurchaseBillsTab,
    },
    {
      value: "debit-notes",
      label: t("ui.web.purchasing.debitNotesTab"),
      Component: DebitNotesTab,
    },
    {
      value: "suppliers",
      label: t("ui.web.purchasing.suppliersTab"),
      Component: SuppliersTab,
    },
    {
      value: "reports",
      label: t("ui.web.purchasing.reportsTab"),
      Component: PurchaseReportsTab,
    },
  ];

  const business = useCurrentBusiness();

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.purchasing.title")}
        description={t("ui.web.purchasing.description")}
      />

      <Tabs defaultValue="orders">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(({ value, Component }) => (
          <TabsContent key={value} value={value} className="pt-4">
            <Component businessId={business.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

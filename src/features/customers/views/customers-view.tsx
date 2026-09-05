"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { ImportDialog } from "@/features/data-transfer/components/import-dialog";
import { rupeesToCents, type SheetRow } from "@/features/data-transfer/parse";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { AddCustomerForm } from "../components/add-customer-form";
import { CustomersTable } from "../components/customers-table";
import { LedgerDialog } from "../components/ledger-dialog";
import { ReferralDialog } from "../components/referral-dialog";
import { customerQueryKeys, customersQueryOptions } from "../queries";
import type { Customer } from "../types";

export function CustomersView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const business = useCurrentBusiness();

  const [search, setSearch] = useState("");
  const [owingOnly, setOwingOnly] = useState(false);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [referring, setReferring] = useState<Customer | null>(null);
  const [importing, setImporting] = useState(false);

  const { data, isFetching } = useQuery(
    customersQueryOptions(business?.id ?? "", search, owingOnly),
  );

  if (!business) {
    return null;
  }

  const rows = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {viewing && (
        <LedgerDialog
          businessId={business.id}
          customer={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      {referring && (
        <ReferralDialog
          businessId={business.id}
          customer={referring}
          onClose={() => setReferring(null)}
        />
      )}

      <PageHeader
        title={t("ui.web.customers.title")}
        description={t("ui.web.customers.description")}
        actions={
          <div className="flex gap-2">
            <ExportMenu businessId={business.id} resource="customers" />
            <Can permission={{ business: ["manage"] }}>
              <Button variant="outline" onClick={() => setImporting(true)}>
                {t("ui.web.data.import")}
              </Button>
            </Can>
          </div>
        }
      />

      <ImportDialog
        businessId={business.id}
        resource="customers"
        open={importing}
        onOpenChange={setImporting}
        note={t("ui.web.data.balanceNote")}
        onDone={() =>
          queryClient.invalidateQueries({ queryKey: customerQueryKeys.all })
        }
        toRow={(row: SheetRow, rowNumber) => {
          const name = row.name ?? "";

          if (!name) {
            return null;
          }

          return {
            rowNumber,
            name,
            ...(row.phone ? { phone: row.phone } : {}),
            ...(row.email ? { email: row.email } : {}),
            ...(row.pan ? { panNumber: row.pan } : {}),
            ...(rupeesToCents(row.creditlimit ?? "") !== undefined && {
              creditLimitCents: rupeesToCents(row.creditlimit ?? ""),
            }),
          };
        }}
      />

      <AddCustomerForm businessId={business.id} />

      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder={t("ui.action.search")}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Switch checked={owingOnly} onCheckedChange={setOwingOnly} />
          <span className="text-sm">{t("ui.web.customers.owingOnly")}</span>
        </div>
      </div>

      {!isFetching && rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.customers.emptyTitle")}
          description={t("ui.web.customers.emptyBody")}
        />
      ) : (
        <CustomersTable
          customers={rows}
          showPoints={business.loyaltyPointsPerHundred > 0}
          onOpenReferral={setReferring}
          onOpenLedger={setViewing}
        />
      )}
    </div>
  );
}

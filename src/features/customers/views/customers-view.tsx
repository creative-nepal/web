"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ContentDialog } from "@/components/composed/content-dialog";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { Can } from "@/features/business/components/can";
import { ExportMenu } from "@/features/data-transfer/components/export-menu";
import { ImportDialog } from "@/features/data-transfer/components/import-dialog";
import { rupeesToCents, type SheetRow } from "@/features/data-transfer/parse";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { money } from "@/lib/money";
import { ReferralDialog } from "../components/referral-dialog";
import {
  customerQueryKeys,
  customersQueryOptions,
  ledgerQueryOptions,
} from "../queries";
import { createCustomer, recordPayment } from "../services";
import type { Customer } from "../types";

function LedgerDialog({
  businessId,
  customer,
  onClose,
}: {
  businessId: string;
  customer: Customer;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  const { data } = useQuery(ledgerQueryOptions(businessId, customer.id));

  const pay = useMutation({
    mutationFn: () =>
      recordPayment(businessId, customer.id, Math.round(Number(amount) * 100)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      setAmount("");
      toast.success(t("ui.web.customers.paymentRecorded"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

  return (
    <ContentDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={`${t("ui.web.customers.ledger")} — ${customer.name}`}
      description={`${t("ui.web.customers.balance")}: ${money(customer.balanceCents)}`}
    >
      <div className="flex flex-col gap-4">
        {customer.balanceCents > 0 && (
          <Can permission={{ invoice: ["issue"] }}>
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="pay-amount">
                  {t("ui.web.customers.recordPayment")}
                </Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
              <Button
                disabled={!amount || pay.isPending}
                onClick={() => pay.mutate()}
              >
                {t("ui.web.customers.recordPayment")}
              </Button>
            </div>
          </Can>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.when")}</TableHead>
              <TableHead>{t("ui.field.action")}</TableHead>
              <TableHead className="text-right">
                {t("ui.field.amount")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.customers.balance")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.data ?? []).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground text-xs">
                  {entry.createdAt.slice(0, 10)}
                </TableCell>
                <TableCell>{entry.type}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(entry.amountCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(entry.balanceAfterCents)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ContentDialog>
  );
}

export function CustomersView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const business = useCurrentBusiness();

  const [search, setSearch] = useState("");
  const [owingOnly, setOwingOnly] = useState(false);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [referring, setReferring] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [importing, setImporting] = useState(false);
  const [limit, setLimit] = useState("");

  const { data, isFetching } = useQuery(
    customersQueryOptions(business?.id ?? "", search, owingOnly),
  );

  const create = useMutation({
    mutationFn: () =>
      createCustomer(business?.id ?? "", {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        creditLimitCents: limit ? Math.round(Number(limit) * 100) : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
      setName("");
      setPhone("");
      setEmail("");
      setLimit("");
      toast.success(t("ui.web.customers.customerAdded"));
    },
    onError: (error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? t("ui.error.generic"),
      );
    },
  });

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

      <Can permission={{ order: ["create"] }}>
        <div className="flex flex-wrap items-end gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("ui.field.name")}
            className="max-w-48"
          />
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t("ui.field.phone")}
            className="max-w-40"
          />
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("ui.field.email")}
            className="max-w-52"
          />
          <Input
            type="number"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            placeholder={t("ui.web.customers.creditLimit")}
            className="max-w-40"
          />
          <Button
            disabled={!name || create.isPending}
            onClick={() => create.mutate()}
          >
            {t("ui.web.customers.addCustomer")}
          </Button>
        </div>
      </Can>

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.name")}</TableHead>
              <TableHead>{t("ui.field.phone")}</TableHead>
              <TableHead>{t("ui.field.email")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.loyalty.points")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.customers.creditLimit")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.web.customers.balance")}
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.phone ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {customer.email ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {business.loyaltyPointsPerHundred > 0
                    ? customer.loyaltyPoints
                    : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(customer.creditLimitCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {customer.balanceCents > 0 ? (
                    <Badge variant="destructive">
                      {money(customer.balanceCents)}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      {t("ui.web.customers.settled")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReferring(customer)}
                  >
                    {t("ui.web.customers.referralTitle")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewing(customer)}
                  >
                    {t("ui.web.customers.ledger")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

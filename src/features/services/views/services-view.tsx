"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/composed/empty-state";
import { PageHeader } from "@/components/composed/page-header";
import { SearchInput } from "@/components/composed/search-input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentBusiness } from "@/features/business/business-provider";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import { membershipsQueryOptions, serviceItemsQueryOptions } from "../queries";

function ServiceCatalogTab({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, isFetching } = useQuery(
    serviceItemsQueryOptions(businessId, search),
  );

  const rows = data?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder={t("ui.web.services.searchPlaceholder")}
        className="max-w-sm"
      />

      {!isFetching && rows.length === 0 ? (
        <EmptyState
          title={t("ui.web.services.emptyTitle")}
          description={t("ui.web.services.emptyBody")}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("ui.field.name")}</TableHead>
              <TableHead>{t("ui.field.category")}</TableHead>
              <TableHead className="text-right">
                {t("ui.web.services.duration")}
              </TableHead>
              <TableHead className="text-right">
                {t("ui.field.price")}
              </TableHead>
              <TableHead>{t("ui.field.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.name}
                  {item.code && (
                    <span className="block text-muted-foreground text-xs">
                      {item.code}
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.category ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {t("ui.web.services.minutes", {
                    count: String(item.durationMinutes),
                  })}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.priceCents)}
                </TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? "outline" : "secondary"}>
                    {t(`common.status.${item.isActive ? "active" : "closed"}`)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function MembershipsTab({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const { data, isFetching } = useQuery(
    membershipsQueryOptions(businessId, ""),
  );

  const rows = data?.data ?? [];

  if (!isFetching && rows.length === 0) {
    return (
      <EmptyState
        title={t("ui.web.services.membershipsEmptyTitle")}
        description={t("ui.web.services.membershipsEmptyBody")}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("ui.web.services.sessions")}</TableHead>
          <TableHead>{t("ui.field.status")}</TableHead>
          <TableHead>{t("ui.web.services.startsAt")}</TableHead>
          <TableHead>{t("ui.web.services.expiresAt")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((membership) => (
          <TableRow key={membership.id}>
            <TableCell className="font-medium tabular-nums">
              {membership.sessionsUsed} / {membership.sessionsTotal}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  membership.status === "active" ? "outline" : "secondary"
                }
              >
                {t(`common.membershipStatus.${membership.status}`)}
              </Badge>
            </TableCell>
            <TableCell>{membership.startsAt.slice(0, 10)}</TableCell>
            <TableCell>{membership.expiresAt?.slice(0, 10) ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ServicesView() {
  const { t } = useTranslation();
  const business = useCurrentBusiness();

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.services.title")}
        description={t("ui.web.services.description")}
      />

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">
            {t("ui.web.services.catalogTab")}
          </TabsTrigger>
          <TabsTrigger value="memberships">
            {t("ui.web.services.membershipsTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="pt-4">
          <ServiceCatalogTab businessId={business.id} />
        </TabsContent>
        <TabsContent value="memberships" className="pt-4">
          <MembershipsTab businessId={business.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

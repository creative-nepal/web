"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/composed/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { formatCurrency } from "@/lib/formatters";
import { menuQueryOptions, restaurantQueryKeys } from "../queries";
import { createMenuItem, setAvailability } from "../services";

export function MenuView() {
  const { t } = useTranslation();

  const business = useCurrentBusiness();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [station, setStation] = useState("main");

  const { data: items } = useQuery(menuQueryOptions(business?.id ?? ""));
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: restaurantQueryKeys.all });

  const add = useMutation({
    mutationFn: () =>
      createMenuItem(business?.id ?? "", {
        name,
        category,
        priceCents: Math.round(Number(price) * 100),
        station,
      }),
    onSuccess: () => {
      setName("");
      setCategory("");
      setPrice("");
      void invalidate();
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      setAvailability(business?.id ?? "", id, isAvailable),
    onSuccess: (item) => {
      void invalidate();
      toast.success(
        item.isAvailable ? `${item.name} is back on` : `${item.name} is 86'd`,
      );
    },
  });

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("ui.web.restaurant.menuTitle")}
        description={t("ui.web.restaurant.menuDescription")}
      />

      <div className="flex flex-wrap items-end gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("ui.web.restaurant.itemName")}
          className="max-w-48"
        />
        <Input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder={t("ui.field.category")}
          className="max-w-40"
        />
        <Input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder={t("ui.field.price")}
          type="number"
          className="max-w-32"
        />
        <Input
          value={station}
          onChange={(event) => setStation(event.target.value)}
          placeholder={t("ui.web.restaurant.station")}
          className="max-w-32"
        />
        <Button
          disabled={!name || !category || !price || add.isPending}
          onClick={() => add.mutate()}
        >
          {t("ui.web.restaurant.addItem")}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("ui.web.restaurant.item")}</TableHead>
            <TableHead>{t("ui.field.category")}</TableHead>
            <TableHead>{t("ui.web.restaurant.station")}</TableHead>
            <TableHead className="text-right">{t("ui.field.price")}</TableHead>
            <TableHead className="text-right">
              {t("ui.web.restaurant.available")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(items ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.station}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(item.priceCents / 100, "NPR")}
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={(checked) =>
                    toggle.mutate({ id: item.id, isAvailable: checked })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

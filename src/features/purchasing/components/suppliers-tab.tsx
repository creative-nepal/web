"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { InlineCreateForm } from "@/components/inline-create-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { purchasingQueryKeys, suppliersQueryOptions } from "../queries";
import { createSupplier } from "../services";

export function SuppliersTab({ businessId }: { businessId: string }) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");

  const { data: suppliers } = useQuery(suppliersQueryOptions(businessId));

  const add = useMutation({
    mutationFn: () =>
      createSupplier(businessId, { name, panNumber: pan || undefined }),
    onSuccess: () => {
      setName("");
      setPan("");
      void queryClient.invalidateQueries({ queryKey: purchasingQueryKeys.all });
      toast.success(t("ui.web.purchasing.supplierAdded"));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <InlineCreateForm
        fields={[
          {
            value: name,
            onChange: setName,
            placeholder: t("ui.web.purchasing.supplierName"),
          },
          {
            value: pan,
            onChange: setPan,
            placeholder: t("ui.web.purchasing.supplierPan"),
            width: "max-w-64",
          },
        ]}
        submitLabel="Add supplier"
        canSubmit={Boolean(name)}
        isPending={add.isPending}
        onSubmit={() => add.mutate()}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("ui.field.name")}</TableHead>
            <TableHead>PAN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(suppliers?.data ?? []).map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell
                className={supplier.panNumber ? "" : "text-destructive"}
              >
                {supplier.panNumber ?? "Missing"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

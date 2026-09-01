"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/composed/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { formatDate } from "@/lib/formatters";
import {
  PURCHASE_ORDER_STATUS_VARIANTS,
  RECEIVABLE_STATUSES,
} from "../constants";
import { useSupplierNames } from "../hooks/use-supplier-names";
import { purchaseOrdersQueryOptions, purchasingQueryKeys } from "../queries";
import { confirmPurchaseOrder } from "../services";
import { ReceiveDialog } from "./receive-dialog";

export function PurchaseOrdersTab({ businessId }: { businessId: string }) {
  const { t } = useTranslation();

  const queryClient = useQueryClient();
  const [receiving, setReceiving] = useState<string | null>(null);
  const supplierName = useSupplierNames(businessId);

  const { data: orders } = useQuery(purchaseOrdersQueryOptions(businessId));

  const confirm = useMutation({
    mutationFn: (poId: string) => confirmPurchaseOrder(businessId, poId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchasingQueryKeys.all });
      toast.success(t("ui.web.purchasing.orderConfirmed"));
    },
  });

  const rows = orders?.data ?? [];

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t("ui.web.purchasing.ordersEmptyTitle")}
        description={t("ui.web.purchasing.ordersEmptyBody")}
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("ui.field.supplier")}</TableHead>
            <TableHead>{t("ui.field.status")}</TableHead>
            <TableHead>{t("ui.web.purchasing.ordered")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {supplierName(order.supplierId)}
              </TableCell>
              <TableCell>
                <Badge variant={PURCHASE_ORDER_STATUS_VARIANTS[order.status]}>
                  {order.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => confirm.mutate(order.id)}
                    >
                      {t("ui.web.purchasing.confirm")}
                    </Button>
                  )}
                  {RECEIVABLE_STATUSES.includes(order.status) && (
                    <Button size="sm" onClick={() => setReceiving(order.id)}>
                      {t("ui.web.purchasing.receive")}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {receiving && (
        <ReceiveDialog
          businessId={businessId}
          purchaseOrderId={receiving}
          onClose={() => setReceiving(null)}
        />
      )}
    </>
  );
}

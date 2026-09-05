"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can } from "@/features/business/components/can";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { customerQueryKeys } from "../queries";
import { createCustomer } from "../services";

export function AddCustomerForm({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createCustomer(businessId, {
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

  return (
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
  );
}

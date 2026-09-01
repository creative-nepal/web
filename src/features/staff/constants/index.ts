import type { Sector } from "@/features/business/types";

export const ROLES_BY_SECTOR: Record<Sector, string[]> = {
  mart: ["manager", "cashier"],
  medical: ["manager", "pharmacist", "cashier"],
  restaurant: ["manager", "waiter", "chef", "cashier"],
};

export const ROLE_LABELS: Record<string, string> = {
  manager: "Manager",
  cashier: "Cashier",
  pharmacist: "Pharmacist",
  waiter: "Waiter",
  chef: "Chef",
};

export const ROLE_HELP: Record<string, string> = {
  manager: "Products, orders, invoices — not business settings",
  cashier: "Take orders and issue invoices only",
  pharmacist:
    "The only role that may dispense prescription or controlled items",
  waiter: "Confirm and serve orders, manage tables",
  chef: "Kitchen tickets only — never sees pricing or billing",
};

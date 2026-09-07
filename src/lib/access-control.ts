import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements as adminDefaultStatements,
  userAc as platformUserAc,
} from "better-auth/plugins/admin/access";
import {
  defaultStatements,
  adminAc as orgAdminAc,
  memberAc as orgMemberAc,
} from "better-auth/plugins/organization/access";

const kernelStatements = {
  business: ["manage"],
  product: ["create", "update", "delete"],
  order: ["create", "refund", "confirm", "serve", "discount"],
  invoice: ["issue", "print", "credit-note"],
  stocktake: ["open", "count", "complete"],
  cash: ["view", "open", "close", "move", "take-payment"],
  wastage: ["view", "record"],
  expense: ["view", "record"],
  calendar: ["view", "manage"],
  report: ["view"],
  production: ["view", "plan", "record"],
} as const;

const sectorStatements = {
  dispense: ["prescription", "controlled"],
  recall: ["view", "quarantine"],
  table: ["manage"],
  kot: ["view", "update"],
  reservation: ["view", "book", "seat", "cancel"],
  appointment: ["book", "complete", "cancel"],
  membership: ["manage"],
  room: ["manage"],
  booking: ["book", "check-in", "check-out", "cancel"],
  folio: ["post", "settle"],
  housekeeping: ["view", "update"],
} as const;

export const statement = {
  ...defaultStatements,
  ...kernelStatements,
  ...sectorStatements,
} as const;

export const ac = createAccessControl(statement);

export const ownerRole = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  ...kernelStatements,
  ...sectorStatements,
});

export const managerRole = ac.newRole({
  product: ["create", "update", "delete"],
  order: ["create", "refund", "confirm", "serve", "discount"],
  invoice: ["issue", "print", "credit-note"],
  stocktake: ["open", "count", "complete"],
  cash: ["view", "open", "close", "move", "take-payment"],
  wastage: ["view", "record"],
  expense: ["view", "record"],
  calendar: ["view", "manage"],
  report: ["view"],
  production: ["view", "plan", "record"],
  recall: ["view", "quarantine"],
  table: ["manage"],
  kot: ["view", "update"],
  reservation: ["view", "book", "seat", "cancel"],
  appointment: ["book", "complete", "cancel"],
  membership: ["manage"],
  room: ["manage"],
  booking: ["book", "check-in", "check-out", "cancel"],
  folio: ["post", "settle"],
  housekeeping: ["view", "update"],
});

export const cashierRole = ac.newRole({
  order: ["create"],
  invoice: ["issue", "print"],
  cash: ["view", "open", "close", "move", "take-payment"],
  calendar: ["view"],
  report: ["view"],
});

export const pharmacistRole = ac.newRole({
  order: ["create"],
  invoice: ["issue", "print"],
  dispense: ["prescription", "controlled"],
  recall: ["view"],
});

export const waiterRole = ac.newRole({
  order: ["create", "confirm", "serve"],
  table: ["manage"],
  kot: ["view"],
  reservation: ["view", "book", "seat"],
  wastage: ["view", "record"],
});

export const chefRole = ac.newRole({
  kot: ["view", "update"],
  wastage: ["view", "record"],
});

export const receptionistRole = ac.newRole({
  order: ["create"],
  invoice: ["issue", "print"],
  appointment: ["book", "cancel"],
  membership: ["manage"],
});

export const practitionerRole = ac.newRole({
  appointment: ["complete"],
});

export const frontDeskRole = ac.newRole({
  order: ["create"],
  invoice: ["issue", "print"],
  booking: ["book", "check-in", "check-out", "cancel"],
  folio: ["post", "settle"],
  housekeeping: ["view"],
  calendar: ["view"],
});

export const housekeeperRole = ac.newRole({
  housekeeping: ["view", "update"],
});

export const roles = {
  admin: orgAdminAc,
  member: orgMemberAc,
  owner: ownerRole,
  manager: managerRole,
  cashier: cashierRole,
  pharmacist: pharmacistRole,
  waiter: waiterRole,
  chef: chefRole,
  receptionist: receptionistRole,
  practitioner: practitionerRole,
  frontDesk: frontDeskRole,
  housekeeper: housekeeperRole,
};

export const platformStatement = {
  ...adminDefaultStatements,
  business: ["list-all", "suspend", "close", "view-any", "set-compliance"],
  plan: ["create", "update", "archive"],
  subscription: ["assign", "cancel", "view-any"],
  audit: ["view-all"],
  content: ["create", "update", "publish", "delete"],
} as const;

export const platformAc = createAccessControl(platformStatement);

export const superAdminRole = platformAc.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
  business: ["list-all", "suspend", "close", "view-any", "set-compliance"],
  plan: ["create", "update", "archive"],
  subscription: ["assign", "cancel", "view-any"],
  audit: ["view-all"],
  content: ["create", "update", "publish", "delete"],
});

export const platformRoles = {
  admin: superAdminRole,
  user: platformUserAc,
};

export type PlatformPermissionRequest = {
  [K in keyof typeof platformStatement]?: Array<
    (typeof platformStatement)[K][number]
  >;
};

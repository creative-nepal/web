import type { ComplianceState } from "../types";

export const BUYER_PAN_REQUIRED_ABOVE_CENTS = 1_000_000;

export const VAT_RATE_PERCENT = 13;

export const QUANTITY_SCALE = 3;

export const PRESCRIPTION_PLACEHOLDER_URL = "pending://in-person";

export const EMPTY_COMPLIANCE: ComplianceState = {
  buyerName: "",
  buyerPan: "",
  doctorName: "",
  patientName: "",
  idNumber: "",
};

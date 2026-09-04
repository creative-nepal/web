export type ImportOutcome = "created" | "updated" | "skipped" | "failed";

export interface ImportRowResult {
  rowNumber: number;
  sku: string | null;
  name: string;
  outcome: ImportOutcome;
  reason?: string;
}

export interface ImportSummary {
  dryRun: boolean;
  created: number;
  updated: number;
  failed: number;
  results: ImportRowResult[];
}

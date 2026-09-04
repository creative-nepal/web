"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/features/i18n/hooks/use-translation";
import { apiErrorMessage } from "@/lib/api-error";
import { parseSpreadsheet, type SheetRow } from "../parse";
import { importRows } from "../services";
import type { ImportSummary } from "../types";

const BATCH_SIZE = 500;

export function ImportDialog<TRow>({
  businessId,
  resource,
  open,
  onOpenChange,
  toRow,
  note,
  onDone,
}: {
  businessId: string;
  resource: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Maps one spreadsheet row to the API's shape, or null to drop it. */
  toRow: (row: SheetRow, rowNumber: number) => TRow | null;
  note?: string;
  onDone?: () => void;
}) {
  const { t } = useTranslation();

  const [rows, setRows] = useState<TRow[]>([]);
  const [preview, setPreview] = useState<ImportSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setRows([]);
    setPreview(null);
  };

  const onPick = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    setBusy(true);
    reset();

    try {
      const sheet = await parseSpreadsheet(file);
      // +2 so the number matches what the user sees in Excel: one for the
      // header, one because spreadsheets count from 1.
      const mapped = sheet
        .map((row, index) => toRow(row, index + 2))
        .filter((row): row is TRow => row !== null);

      if (mapped.length === 0) {
        toast.error(t("ui.web.data.nothingToImport"));
        return;
      }

      setRows(mapped);
      setPreview(
        await importRows(
          businessId,
          resource,
          mapped.slice(0, BATCH_SIZE),
          true,
        ),
      );
    } catch (error) {
      toast.error(apiErrorMessage(error, t("ui.web.data.importFailed")));
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    setBusy(true);

    try {
      let created = 0;
      let updated = 0;

      for (let index = 0; index < rows.length; index += BATCH_SIZE) {
        const summary = await importRows(
          businessId,
          resource,
          rows.slice(index, index + BATCH_SIZE),
          false,
        );
        created += summary.created;
        updated += summary.updated;
      }

      toast.success(t("ui.web.data.imported", { created, updated }));
      reset();
      onOpenChange(false);
      onDone?.();
    } catch (error) {
      toast.error(apiErrorMessage(error, t("ui.web.data.importFailed")));
    } finally {
      setBusy(false);
    }
  };

  const problems = preview?.results.filter((row) => row.outcome === "failed");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("ui.web.data.importTitle")}</DialogTitle>
          <DialogDescription>{t("ui.web.data.importHint")}</DialogDescription>
        </DialogHeader>

        <Input
          type="file"
          accept=".csv,.xlsx"
          disabled={busy}
          onChange={(event) => void onPick(event.target.files?.[0])}
        />

        {note && <p className="text-muted-foreground text-xs">{note}</p>}

        {busy && !preview && (
          <p className="text-muted-foreground text-sm">
            {t("ui.web.data.parsing")}
          </p>
        )}

        {preview && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {t("ui.web.data.rowsFound", { count: rows.length })}
              </Badge>
              <Badge>
                {t("ui.web.data.willCreate", { count: preview.created })}
              </Badge>
              <Badge variant="secondary">
                {t("ui.web.data.willUpdate", { count: preview.updated })}
              </Badge>
              {preview.failed > 0 && (
                <Badge variant="destructive">
                  {t("ui.web.data.willFail", { count: preview.failed })}
                </Badge>
              )}
            </div>

            {problems && problems.length > 0 && (
              <div className="max-h-56 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">
                        {t("ui.web.data.row")}
                      </TableHead>
                      <TableHead>{t("ui.field.name")}</TableHead>
                      <TableHead>{t("ui.web.data.problem")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="tabular-nums">
                          {row.rowNumber}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-destructive text-sm">
                          {row.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            disabled={
              busy || !preview || preview.created + preview.updated === 0
            }
            onClick={() => void commit()}
          >
            {t("ui.web.data.commit", {
              count: (preview?.created ?? 0) + (preview?.updated ?? 0),
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

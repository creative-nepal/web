import ExcelJS from "exceljs";

export type SheetRow = Record<string, string>;

/** Header → the field name the API expects. */
export type ColumnMap = Record<string, string>;

function normaliseHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (quoted) {
      if (char === '"' && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell);
  return cells;
}

function toRows(headers: string[], lines: string[][]): SheetRow[] {
  const keys = headers.map(normaliseHeader);

  return lines
    .filter((cells) => cells.some((cell) => cell.trim() !== ""))
    .map((cells) =>
      Object.fromEntries(
        keys.map((key, index) => [key, (cells[index] ?? "").trim()]),
      ),
    );
}

async function parseCsv(file: File): Promise<SheetRow[]> {
  // Excel writes a BOM; leaving it turns the first header into "﻿Name".
  const text = (await file.text()).replace(/^﻿/, "");
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map(splitCsvLine);

  if (lines.length < 2) {
    return [];
  }

  return toRows(lines[0], lines.slice(1));
}

async function parseXlsx(file: File): Promise<SheetRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    return [];
  }

  const grid: string[][] = [];

  sheet.eachRow((row) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      cells.push(cell.text?.trim() ?? "");
    });
    grid.push(cells);
  });

  // Our own exports carry a title and a subtitle before the headers, so the
  // header row is whichever line first looks like one rather than line 1.
  const headerIndex = grid.findIndex(
    (cells) => cells.filter((cell) => cell !== "").length > 1,
  );

  if (headerIndex === -1 || grid.length < headerIndex + 2) {
    return [];
  }

  return toRows(grid[headerIndex], grid.slice(headerIndex + 1));
}

export async function parseSpreadsheet(file: File): Promise<SheetRow[]> {
  return file.name.toLowerCase().endsWith(".csv")
    ? parseCsv(file)
    : parseXlsx(file);
}

export function rupeesToCents(value: string): number | undefined {
  if (value === "") {
    return undefined;
  }

  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : undefined;
}

export function toNumber(value: string): number | undefined {
  if (value === "") {
    return undefined;
  }

  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

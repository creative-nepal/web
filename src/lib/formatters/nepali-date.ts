import pkg from "nepali-date-converter";

const NepaliDate = (pkg as { default?: unknown }).default ?? pkg;

type NepaliDateInstance = {
  getYear(): number;
  getMonth(): number;
  getDate(): number;
  format(pattern: string, language?: string): string;
  toJsDate(): Date;
};

type NepaliDateConstructor = {
  new (date: Date): NepaliDateInstance;
  new (year: number, month: number, day: number): NepaliDateInstance;
};

const Nepali = NepaliDate as NepaliDateConstructor;

export const NEPAL_UTC_OFFSET_MINUTES = 5 * 60 + 45;

export const BS_MONTH_NAMES = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

function nepaliFor(instant: Date): NepaliDateInstance {
  const shifted = new Date(
    instant.getTime() + NEPAL_UTC_OFFSET_MINUTES * 60_000,
  );

  return new Nepali(
    new Date(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      12,
    ),
  );
}

export function toBs(instant: Date): {
  year: number;
  month: number;
  day: number;
} {
  const bs = nepaliFor(instant);

  return { year: bs.getYear(), month: bs.getMonth() + 1, day: bs.getDate() };
}

export function formatBs(instant: Date, language: "en" | "ne" = "en"): string {
  return language === "ne"
    ? nepaliFor(instant).format("YYYY MMMM DD", "np")
    : nepaliFor(instant).format("YYYY MMMM DD");
}

export function fromBs(year: number, month: number, day: number): Date {
  const local = new Nepali(year, month - 1, day).toJsDate();

  return new Date(
    Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()) -
      NEPAL_UTC_OFFSET_MINUTES * 60_000,
  );
}

export function bsMonthLength(year: number, month: number): number {
  for (let day = 32; day > 28; day -= 1) {
    try {
      const candidate = new Nepali(year, month - 1, day);

      if (candidate.getMonth() === month - 1 && candidate.getDate() === day) {
        return day;
      }
    } catch {}
  }

  return 30;
}

export function bsMonthWindow(
  year: number,
  month: number,
): { from: Date; to: Date; days: number } {
  const days = bsMonthLength(year, month);

  return {
    from: fromBs(year, month, 1),
    to: new Date(fromBs(year, month, days).getTime() + 86_400_000 - 1),
    days,
  };
}

export function shiftBsMonth(
  year: number,
  month: number,
  by: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + by;

  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

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

const DEVANAGARI = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toDevanagari(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => DEVANAGARI[Number(digit)]);
}

export const BS_WEEKDAYS_NE = [
  "आइतवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "बिहिवार",
  "शुक्रवार",
  "शनिवार",
] as const;

export const BS_WEEKDAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export interface GridCell {
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  ad: string;
  adDay: number;
  weekday: number;
  inMonth: boolean;
  isToday: boolean;
  isSaturday: boolean;
  isSunday: boolean;
}

function adKey(instant: Date): string {
  const shifted = new Date(
    instant.getTime() + NEPAL_UTC_OFFSET_MINUTES * 60_000,
  );

  return shifted.toISOString().slice(0, 10);
}

function cellFor(
  year: number,
  month: number,
  day: number,
  inMonth: boolean,
  todayKey: string,
): GridCell {
  const start = fromBs(year, month, day);
  const noon = new Date(start.getTime() + 12 * 3_600_000);
  const key = adKey(start);
  const weekday = noon.getUTCDay();

  return {
    bsYear: year,
    bsMonth: month,
    bsDay: day,
    ad: key,
    adDay: Number(key.slice(8, 10)),
    weekday,
    inMonth,
    isToday: key === todayKey,
    isSaturday: weekday === 6,
    isSunday: weekday === 0,
  };
}

export function bsMonthGrid(year: number, month: number): GridCell[][] {
  const days = bsMonthLength(year, month);
  const todayKey = adKey(new Date());

  const current = Array.from({ length: days }, (_, index) =>
    cellFor(year, month, index + 1, true, todayKey),
  );

  const leading = current[0].weekday;
  const previous = shiftBsMonth(year, month, -1);
  const previousLength = bsMonthLength(previous.year, previous.month);

  const before = Array.from({ length: leading }, (_, index) =>
    cellFor(
      previous.year,
      previous.month,
      previousLength - leading + index + 1,
      false,
      todayKey,
    ),
  );

  const next = shiftBsMonth(year, month, 1);
  const trailing = (7 - ((before.length + current.length) % 7)) % 7;

  const after = Array.from({ length: trailing }, (_, index) =>
    cellFor(next.year, next.month, index + 1, false, todayKey),
  );

  const all = [...before, ...current, ...after];
  const weeks: GridCell[][] = [];

  for (let index = 0; index < all.length; index += 7) {
    weeks.push(all.slice(index, index + 7));
  }

  return weeks;
}

export function currentBsMonth(): { year: number; month: number } {
  const now = toBs(new Date());

  return { year: now.year, month: now.month };
}

export const BS_MONTH_NAMES_NE = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत",
] as const;

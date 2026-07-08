import { addDays, differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns";

export interface BlockedDate {
  date: string;
  summary?: string;
}

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function parseIcsDate(value: string): Date {
  const cleaned = value.trim().replace(/;.*$/, "");

  if (/^\d{8}$/.test(cleaned)) {
    const year = Number(cleaned.slice(0, 4));
    const month = Number(cleaned.slice(4, 6)) - 1;
    const day = Number(cleaned.slice(6, 8));
    return new Date(Date.UTC(year, month, day));
  }

  if (/^\d{8}T\d{6}Z?$/.test(cleaned)) {
    const year = Number(cleaned.slice(0, 4));
    const month = Number(cleaned.slice(4, 6)) - 1;
    const day = Number(cleaned.slice(6, 8));
    const hour = Number(cleaned.slice(9, 11));
    const minute = Number(cleaned.slice(11, 13));
    const second = Number(cleaned.slice(13, 15));
    const utc = cleaned.endsWith("Z");
    return utc
      ? new Date(Date.UTC(year, month, day, hour, minute, second))
      : new Date(year, month, day, hour, minute, second);
  }

  return new Date(cleaned);
}

function unfoldIcsLines(content: string) {
  const rawLines = content.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const line of rawLines) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  return lines;
}

export function parseBlockedDatesFromIcs(content: string, from: Date, to: Date): BlockedDate[] {
  const lines = unfoldIcsLines(content);
  const blocked: BlockedDate[] = [];
  const seen = new Set<string>();

  let inEvent = false;
  let start: Date | null = null;
  let end: Date | null = null;
  let summary: string | undefined;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      start = null;
      end = null;
      summary = undefined;
      continue;
    }

    if (line === "END:VEVENT") {
      if (start) {
        const intervalEnd = end ? addDays(end, -1) : start;

        if (intervalEnd >= from && start <= to) {
          const days = eachDayOfInterval({
            start: start < from ? from : start,
            end: intervalEnd > to ? to : intervalEnd,
          });

          for (const day of days) {
            const key = toDateKey(day);
            if (!seen.has(key)) {
              seen.add(key);
              blocked.push({ date: key, summary });
            }
          }
        }
      }

      inEvent = false;
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith("DTSTART")) {
      start = parseIcsDate(line.split(":")[1] ?? "");
    }

    if (line.startsWith("DTEND")) {
      end = parseIcsDate(line.split(":")[1] ?? "");
    }

    if (line.startsWith("SUMMARY:")) {
      summary = line.slice("SUMMARY:".length);
    }
  }

  return blocked.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getBlockedDates(
  icalUrl: string,
  from: Date,
  to: Date,
): Promise<BlockedDate[]> {
  if (!icalUrl) return [];

  const response = await fetch(icalUrl, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar iCal (${response.status})`);
  }

  const content = await response.text();
  return parseBlockedDatesFromIcs(content, from, to);
}

export function isRangeAvailable(
  blockedDates: BlockedDate[],
  checkIn: string,
  checkOut: string,
) {
  const blockedSet = new Set(blockedDates.map((item) => item.date));
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const nights = differenceInCalendarDays(end, start);

  if (nights <= 0) return false;

  const stayDays = eachDayOfInterval({
    start,
    end: addDays(end, -1),
  });

  return stayDays.every((day) => !blockedSet.has(toDateKey(day)));
}

export function countNights(checkIn: string, checkOut: string) {
  return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
}

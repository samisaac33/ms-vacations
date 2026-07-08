import { describe, expect, test } from "vitest";
import { parseBlockedDatesFromIcs } from "@/lib/ical";

const sampleIcs = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Reserva
DTSTART;VALUE=DATE:20260810
DTEND;VALUE=DATE:20260813
END:VEVENT
END:VCALENDAR`;

describe("parseBlockedDatesFromIcs", () => {
  test("extrae fechas bloqueadas de un archivo iCal", () => {
    const blocked = parseBlockedDatesFromIcs(
      sampleIcs,
      new Date("2026-08-01"),
      new Date("2026-08-31"),
    );

    expect(blocked.map((item) => item.date)).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
    ]);
  });
});

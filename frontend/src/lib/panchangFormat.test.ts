import { describe, expect, it } from "vitest";
import { addDays, formatClock, formatDuration, formatLongDate, formatOffset, formatShortDate, formatWithDay, isSupportedDate } from "./panchangFormat";
import { lt } from "@/test/panchangFixture";

describe("panchangFormat", () => {
  it("formats wall-clock times in 12-hour form", () => {
    expect(formatClock("00:05:00")).toBe("12:05 AM");
    expect(formatClock("06:32:03")).toBe("6:32 AM");
    expect(formatClock("12:00:00")).toBe("12:00 PM");
    expect(formatClock("23:59:59")).toBe("11:59 PM");
  });

  it("appends the date only when a time falls on another day", () => {
    expect(formatWithDay(lt("2025-03-14T12:24:35", "2025-03-14"))).toBe("12:24 PM");
    expect(formatWithDay(lt("2025-03-15T00:27:00", "2025-03-14"))).toBe("12:27 AM, 15 Mar");
    expect(formatWithDay(lt("2025-03-13T23:30:00", "2025-03-14"))).toBe("11:30 PM, 13 Mar");
  });

  it("formats dates and offsets", () => {
    expect(formatShortDate("2025-03-05")).toBe("5 Mar");
    expect(formatLongDate("2025-03-14")).toBe("Friday, 14 March 2025");
    expect(formatOffset(330)).toBe("UTC+05:30");
    expect(formatOffset(-240)).toBe("UTC-04:00");
    expect(formatOffset(0)).toBe("UTC+00:00");
    expect(formatDuration(717)).toBe("11h 57m");
  });

  it("does date arithmetic on calendar dates", () => {
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
    expect(addDays("2025-03-14", 0)).toBe("2025-03-14");
  });

  it("validates supported dates", () => {
    expect(isSupportedDate("2025-02-28")).toBe(true);
    expect(isSupportedDate("2025-02-30")).toBe(false);
    expect(isSupportedDate("")).toBe(false);
    expect(isSupportedDate("1899-12-31")).toBe(false);
    expect(isSupportedDate("2101-01-01")).toBe(false);
    expect(isSupportedDate("14-03-2025")).toBe(false);
  });
});

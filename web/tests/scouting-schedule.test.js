import { describe, expect, test } from "bun:test";
import { packToday, partitionDates } from "../../site/static/scouting/assets/app.js";

describe("Pack 60 schedule", () => {
  test("uses the pack's Chicago calendar date across midnight", () => {
    expect(packToday(new Date("2026-11-21T05:59:00Z"))).toBe("2026-11-20");
    expect(packToday(new Date("2026-11-21T06:00:00Z"))).toBe("2026-11-21");
    expect(packToday(new Date("2027-07-01T05:00:00Z"))).toBe("2027-07-01");
  });

  test("sorts upcoming dates and archives an event only after its final day", () => {
    const events = [{ date: "2027-02-05" }, { date: "2027-01-01", end: "2027-01-03" }, { date: "2026-11-16" }];
    const during = partitionDates(events, "2027-01-03");
    expect(during.upcoming.map(item => item.date)).toEqual(["2027-01-01", "2027-02-05"]);
    expect(during.past.map(item => item.date)).toEqual(["2026-11-16"]);
    expect(partitionDates(events, "2027-01-04").past.map(item => item.date)).toEqual(["2027-01-01", "2026-11-16"]);
  });
});

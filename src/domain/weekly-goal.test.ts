import { describe, expect, it } from "vitest";
import { reykjavikIsoWeekKey } from "./weekly-goal";

describe("vikumarkmið", () => {
  it("notar ISO-vikur frá mánudegi til sunnudags í Reykjavík", () => {
    expect(reykjavikIsoWeekKey("2026-09-07T00:01:00Z")).toBe("2026-W37");
    expect(reykjavikIsoWeekKey("2026-09-13T23:59:00Z")).toBe("2026-W37");
    expect(reykjavikIsoWeekKey("2026-09-14T00:01:00Z")).toBe("2026-W38");
  });
});

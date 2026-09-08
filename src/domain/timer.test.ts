import { describe, expect, it } from "vitest";
import { formatTime, secondsRemaining } from "./timer";

describe("tímamælir", () => {
  it("reiknar frá lokatíma og þolir að síðan sofni", () => expect(secondsRemaining(11_000, 5_500)).toBe(6));
  it("fer aldrei undir núll", () => expect(secondsRemaining(1_000, 2_000)).toBe(0));
  it("sýnir stóran mínútu- og sekúndutíma", () => expect(formatTime(65)).toBe("01:05"));
});

import { describe, expect, it } from "vitest";

import { calculateRoi } from "./recommendations";

describe("recommendation calculations", () => {
  it("calculates total study cost and a bounded payback estimate", () => {
    expect(calculateRoi({ annualTuition: 30_000, annualLivingCost: 15_000, years: 4, startingSalary: 42_000 })).toEqual({
      totalCost: 180_000,
      paybackYears: 12.2,
      fiveYearEarnings: 229_320,
    });
  });
});

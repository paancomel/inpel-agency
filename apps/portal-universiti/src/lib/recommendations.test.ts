import { describe, expect, it } from "vitest";

import { calculateRoi, mapUniversityRows } from "./recommendations";

describe("recommendation calculations", () => {
  it("calculates total study cost and a bounded payback estimate", () => {
    expect(calculateRoi({ annualTuition: 30_000, annualLivingCost: 15_000, years: 4, startingSalary: 42_000 })).toEqual({
      totalCost: 180_000,
      paybackYears: 12.2,
      fiveYearEarnings: 229_320,
    });
  });

  it("normalizes sparse database rows into display-safe matches", () => {
    const matches = mapUniversityRows([
      {
        id: "university-1",
        name: "Example University",
        location: null,
        address: null,
        logo_url: null,
        tuition_fees: null,
        living_costs: null,
        acceptance_rate: null,
        facilities_flags: null,
      contacts: null,
      created_at: null,
      representative_id: null,
      },
    ]);

    expect(matches[0]).toMatchObject({
      name: "Example University",
      location: "Malaysia",
      tuition: 32_000,
      matchScore: 92,
    });
  });
});

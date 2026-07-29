import { describe, expect, it } from "vitest";

import { canUseInstitutionDemo } from "./runtime";

describe("institution demo guard", () => {
  it("never permits a demo bypass in a production build", () => {
    expect(canUseInstitutionDemo(false)).toBe(false);
    expect(canUseInstitutionDemo(true)).toBe(true);
  });
});

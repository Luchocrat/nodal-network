import { describe, expect, it } from "vitest";
import { runAssessment } from "@/lib/scenario";
import { deterministicExplanation } from "@/lib/explain-local";

const base = { demandKw: 120, generationKw: 80, batteryKwh: 150, nodeId: "RIDGE_01", noaaStatus: "fetched" as const };

describe("deterministic fallback explanation", () => {
  it("uses only assessment values and keeps suitability undetermined", () => {
    const text = deterministicExplanation(runAssessment(base)).flatMap((s) => s.lines).join("\n");
    expect(text).toContain("−40 kW");
    expect(text).toContain("42 kW");
    expect(text).toContain("NODAL-ACT-MITIGATE-SHORTFALL");
    expect(text).toContain("undetermined");
    expect(text).not.toMatch(/is safe|are safe|deemed safe/i);
  });
  it("is identical for identical inputs", () => {
    expect(JSON.stringify(deterministicExplanation(runAssessment(base)))).toBe(JSON.stringify(deterministicExplanation(runAssessment({ ...base }))));
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { runAssessment, type ScenarioInput } from "@/lib/scenario";
import { network } from "@/lib/network";

const base: ScenarioInput = { demandKw: 60, generationKw: 80, batteryKwh: 150, nodeId: "RIDGE_01", noaaStatus: "fetched" };

describe("scenario engine", () => {
  it("is deterministic: identical inputs give identical JSON", () => {
    expect(JSON.stringify(runAssessment(base))).toBe(JSON.stringify(runAssessment({ ...base })));
    expect(runAssessment(base).assessmentId).toBe(runAssessment(base).assessmentId);
  });

  it("computes netPowerKw = generation − demand", () => {
    expect(runAssessment(base).power.netPowerKw).toBe(20);
    expect(runAssessment({ ...base, demandKw: 120 }).power.netPowerKw).toBe(-40);
  });

  it("changes recommendation when demand rises past generation", () => {
    const ok = runAssessment(base);
    const short = runAssessment({ ...base, demandKw: 120 });
    expect(ok.power.energyStatus).toBe("SURPLUS");
    expect(ok.action.id).toBe("NODAL-ACT-COMMISSION-LOCAL-STUDIES");
    expect(short.power.energyStatus).toBe("SHORTFALL");
    expect(short.action.id).toBe("NODAL-ACT-MITIGATE-SHORTFALL");
    expect(short.action.text).toContain("40 kW");
  });

  it("battery runtime = kWh / shortfall, only on shortfall, UNKNOWN when battery not provided", () => {
    expect(runAssessment({ ...base, demandKw: 120 }).power.batteryRuntimeHours).toBe(3.75);
    expect(runAssessment(base).power.batteryRuntimeHours).toBeNull();
    const noBatt = runAssessment({ ...base, demandKw: 120, batteryKwh: null });
    expect(noBatt.power.batteryRuntimeHours).toBeNull();
    expect(noBatt.rules.find((r) => r.id === "NODAL-PWR-040")?.status).toBe("UNKNOWN");
    expect(runAssessment({ ...base, demandKw: 120, batteryKwh: 0 }).power.batteryRuntimeHours).toBe(0);
  });

  it("handles exact zero margin", () => {
    const a = runAssessment({ ...base, demandKw: 80 });
    expect(a.power.energyStatus).toBe("ZERO_MARGIN");
    expect(a.power.netPowerKw).toBe(0);
  });

  it("never certifies a site: verdict is DO NOT DEPLOY YET with all gaps UNKNOWN regardless of surplus", () => {
    for (const demandKw of [0, 60, 80, 200]) {
      const a = runAssessment({ ...base, demandKw });
      expect(a.verdict.headline).toBe("DO NOT DEPLOY YET");
      expect(a.verdict.siteSuitability).toBe("UNDETERMINED");
      expect(a.dataGaps.every((g) => g.status === "UNKNOWN")).toBe(true);
      expect(a.rules.find((r) => r.id === "NODAL-ENV-000")?.status).toBe("TRIGGERED");
    }
  });

  it("has stable rule IDs", () => {
    expect(runAssessment(base).rules.map((r) => r.id)).toEqual([
      "NODAL-PWR-001", "NODAL-PWR-010", "NODAL-PWR-020", "NODAL-PWR-030", "NODAL-PWR-040", "NODAL-NODE-001", "NODAL-OBS-001", "NODAL-ENV-001", "NODAL-ENV-000",
    ]);
  });

  it("allocates demand by shared workload share; connectors carry none", () => {
    expect(runAssessment(base).selectedNode?.allocatedDemandKw).toBe(21);
    expect(runAssessment({ ...base, nodeId: "CONNECTOR_01" }).selectedNode?.allocatedDemandKw).toBe(0);
    const total = network.nodes.reduce((s, n) => s + n.simulatedWorkloadPct, 0);
    expect(total).toBe(100);
  });

  it("marks NOAA context UNKNOWN when unavailable", () => {
    const r = runAssessment({ ...base, noaaStatus: "unavailable" }).rules.find((x) => x.id === "NODAL-OBS-001");
    expect(r?.status).toBe("UNKNOWN");
    expect(r?.tag).toBe("UNKNOWN");
  });

  it("rejects invalid input instead of guessing", () => {
    const a = runAssessment({ ...base, demandKw: -1, nodeId: "NOPE" });
    expect(a.valid).toBe(false);
    expect(a.power.netPowerKw).toBeNull();
    expect(a.errors.length).toBe(2);
    expect(runAssessment({ ...base, generationKw: Number.NaN }).valid).toBe(false);
  });
});

describe("shared/network.json contract", () => {
  const sharedPath = path.resolve(__dirname, "../../shared/network.json");
  it("web copy is identical to the shared file (IDs/positions unchanged)", () => {
    if (!existsSync(sharedPath)) return; // web/ deployed alone
    expect(JSON.parse(readFileSync(sharedPath, "utf8"))).toEqual(network);
  });
  it("contains the six frozen node IDs, ATOL and junction", () => {
    expect(network.nodes.map((n) => n.id)).toEqual(["RIDGE_01", "CONNECTOR_01", "CANYON_01", "CONNECTOR_02", "RIDGE_02", "CANYON_02"]);
    expect(network.surfaceHub.id).toBe("ATOL_01");
    expect(network.seafloorJunction.id).toBe("JUNCTION_01");
  });
});

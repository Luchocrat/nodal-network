/**
 * NODAL deterministic scenario engine.
 *
 * Pure function: same inputs → byte-identical output (no clock, no randomness, no network).
 * Everything the user moves is SIMULATED. Nothing here scores or certifies ecological safety:
 * an energy surplus says nothing about whether a site is environmentally suitable.
 */
import { nodeById, type NodeType } from "./network";

export type Tag = "OBSERVED" | "SIMULATED" | "CONCEPTUAL" | "UNKNOWN";

export interface ScenarioInput {
  /** Total simulated compute demand across the network (kW). */
  demandKw: number;
  /** Total simulated renewable generation (kW). */
  generationKw: number;
  /** Optional simulated usable battery energy (kWh). null = not provided. */
  batteryKwh: number | null;
  /** Selected network node id (from shared/network.json). */
  nodeId: string;
  /** Status of the NOAA observation retrieval, supplied by caller (context only). */
  noaaStatus: "fetched" | "partial" | "cached" | "unavailable" | "unknown";
}

export const LIMITS = {
  demandKw: { min: 0, max: 200, step: 1 },
  generationKw: { min: 0, max: 200, step: 1 },
  batteryKwh: { min: 0, max: 2000, step: 10 },
} as const;

export const DEFAULTS: Omit<ScenarioInput, "nodeId" | "noaaStatus"> = {
  demandKw: 60,
  generationKw: 80,
  batteryKwh: 150,
};

export type RuleStatus = "TRIGGERED" | "NOT_TRIGGERED" | "UNKNOWN";

export interface RuleResult {
  id: string;
  title: string;
  status: RuleStatus;
  tag: Tag;
  detail: string;
}

export interface DataGap {
  id: string;
  label: string;
  status: "UNKNOWN";
  why: string;
}

export interface Assessment {
  schemaVersion: "nodal-assessment/1";
  assessmentId: string;
  valid: boolean;
  errors: string[];
  inputs: { id: string; label: string; value: number | string | null; unit: string; tag: Tag }[];
  power: {
    netPowerKw: number | null;
    formula: string;
    energyStatus: "SHORTFALL" | "ZERO_MARGIN" | "SURPLUS" | "INVALID";
    shortfallKw: number | null;
    batteryRuntimeHours: number | null;
    batteryRuntimeFormula: string | null;
    tag: "SIMULATED";
  };
  selectedNode: {
    id: string;
    type: NodeType;
    label: string;
    workloadSharePct: number;
    allocatedDemandKw: number;
    note: string;
    tag: "CONCEPTUAL";
  } | null;
  rules: RuleResult[];
  dataGaps: DataGap[];
  assumptions: string[];
  action: { id: string; text: string; tag: "SIMULATED" | "UNKNOWN" };
  verdict: {
    id: "NODAL-VERDICT-001";
    siteSuitability: "UNDETERMINED";
    deploymentReadiness: "NOT_ESTABLISHED";
    headline: string;
    basis: string;
  };
}

export const DATA_GAPS: DataGap[] = [
  { id: "NODAL-GAP-THERMAL", label: "Local thermal regime", status: "UNKNOWN", why: "No site-specific temperature profile or thermal model; regional station readings are not the NODAL site." },
  { id: "NODAL-GAP-CURRENT", label: "Local current speed and direction", status: "UNKNOWN", why: "No current measurement is available: the NOAA currents request for station 8723214 returned no data. Water level (tide height) is not current velocity." },
  { id: "NODAL-GAP-BATHY", label: "Bathymetry and seabed substrate", status: "UNKNOWN", why: "Scene coordinates are hypothetical; no survey exists for any real location." },
  { id: "NODAL-GAP-HABITAT", label: "Habitat and benthic community survey", status: "UNKNOWN", why: "No benthic or biological survey data is held." },
  { id: "NODAL-GAP-PERMIT", label: "Permitting and regulatory review", status: "UNKNOWN", why: "No permitting or stakeholder review has been performed." },
];

export const ASSUMPTIONS: string[] = [
  "All power and battery values are SIMULATED inputs, not measurements of any installation.",
  "Net power = simulated generation − simulated demand; conversion, transmission and cooling losses are ignored.",
  "Battery runtime = usable battery kWh ÷ shortfall kW, computed only when there is a shortfall; no depth-of-discharge or ageing model.",
  "Per-node demand share uses the illustrative simulatedWorkloadPct values in shared/network.json; this is not a hardware capacity claim.",
  "NOAA observations are regional context from a shore station; they are not used as inputs to the power calculation and no ecological threshold is applied.",
];

const EPS = 1e-9;
const round = (n: number, d = 3) => {
  const f = 10 ** d;
  const r = Math.round((n + Number.EPSILON) * f) / f;
  return Object.is(r, -0) ? 0 : r;
};

/** FNV-1a 32-bit over a canonical string — stable id for "same inputs → same assessment". */
function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function validate(i: ScenarioInput): string[] {
  const errs: string[] = [];
  const nonNeg = (v: unknown, name: string) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) errs.push(`${name} must be a finite number ≥ 0`);
  };
  nonNeg(i.demandKw, "demandKw");
  nonNeg(i.generationKw, "generationKw");
  if (i.batteryKwh !== null) nonNeg(i.batteryKwh, "batteryKwh");
  if (!nodeById.has(i.nodeId)) errs.push(`nodeId "${i.nodeId}" is not in shared/network.json`);
  return errs;
}

export function runAssessment(input: ScenarioInput): Assessment {
  const errors = validate(input);
  const valid = errors.length === 0;

  const inputs: Assessment["inputs"] = [
    { id: "demandKw", label: "Compute demand", value: valid ? input.demandKw : null, unit: "kW", tag: "SIMULATED" },
    { id: "generationKw", label: "Renewable generation", value: valid ? input.generationKw : null, unit: "kW", tag: "SIMULATED" },
    { id: "batteryKwh", label: "Usable battery energy (optional)", value: valid ? input.batteryKwh : null, unit: "kWh", tag: "SIMULATED" },
    { id: "nodeId", label: "Selected node", value: input.nodeId, unit: "id", tag: "CONCEPTUAL" },
  ];

  const node = nodeById.get(input.nodeId);

  if (!valid || !node) {
    const base: Omit<Assessment, "assessmentId"> = {
      schemaVersion: "nodal-assessment/1",
      valid: false,
      errors,
      inputs,
      power: { netPowerKw: null, formula: "netPowerKw = generationKw − demandKw", energyStatus: "INVALID", shortfallKw: null, batteryRuntimeHours: null, batteryRuntimeFormula: null, tag: "SIMULATED" },
      selectedNode: null,
      rules: [{ id: "NODAL-INPUT-001", title: "Inputs valid", status: "TRIGGERED", tag: "SIMULATED", detail: errors.join("; ") }],
      dataGaps: DATA_GAPS,
      assumptions: ASSUMPTIONS,
      action: { id: "NODAL-ACT-FIX-INPUT", text: "Correct the invalid scenario input before interpreting any result.", tag: "UNKNOWN" },
      verdict: verdict(),
    };
    return { ...base, assessmentId: fnv1a(JSON.stringify(base)) };
  }

  const net = round(input.generationKw - input.demandKw);
  const status: Assessment["power"]["energyStatus"] = Math.abs(net) < EPS ? "ZERO_MARGIN" : net < 0 ? "SHORTFALL" : "SURPLUS";
  const shortfallKw = status === "SHORTFALL" ? round(-net) : null;
  const batteryProvided = input.batteryKwh !== null;
  const runtime = shortfallKw !== null && batteryProvided ? round((input.batteryKwh as number) / Math.max(0, shortfallKw), 2) : null;

  const share = node.simulatedWorkloadPct;
  const allocated = round((input.demandKw * share) / 100);
  const nodeNote =
    node.type === "CONNECTOR"
      ? "Connector nodes are not assumed to host compute cartridges (shared/network.json); workload share is 0 %."
      : `Illustrative workload share ${share} % of total simulated demand.`;

  const rules: RuleResult[] = [
    {
      id: "NODAL-PWR-001",
      title: "Net power balance computed",
      status: "TRIGGERED",
      tag: "SIMULATED",
      detail: `netPowerKw = ${input.generationKw} − ${input.demandKw} = ${net} kW`,
    },
    {
      id: "NODAL-PWR-010",
      title: "Energy shortfall",
      status: status === "SHORTFALL" ? "TRIGGERED" : "NOT_TRIGGERED",
      tag: "SIMULATED",
      detail: status === "SHORTFALL" ? `Simulated demand exceeds simulated generation by ${shortfallKw} kW.` : "Simulated generation covers simulated demand.",
    },
    {
      id: "NODAL-PWR-020",
      title: "Zero energy margin",
      status: status === "ZERO_MARGIN" ? "TRIGGERED" : "NOT_TRIGGERED",
      tag: "SIMULATED",
      detail: status === "ZERO_MARGIN" ? "Generation equals demand; no headroom in the simulation." : "Not at exactly zero margin.",
    },
    {
      id: "NODAL-PWR-030",
      title: "Energy surplus",
      status: status === "SURPLUS" ? "TRIGGERED" : "NOT_TRIGGERED",
      tag: "SIMULATED",
      detail: status === "SURPLUS" ? `Simulated generation exceeds demand by ${net} kW. This is NOT an environmental safety finding.` : "No surplus in the simulation.",
    },
    {
      id: "NODAL-PWR-040",
      title: "Battery runtime during shortfall",
      status: status !== "SHORTFALL" ? "NOT_TRIGGERED" : runtime === null ? "UNKNOWN" : "TRIGGERED",
      tag: runtime === null && status === "SHORTFALL" ? "UNKNOWN" : "SIMULATED",
      detail:
        status !== "SHORTFALL"
          ? "Not applicable: no shortfall."
          : runtime === null
            ? "No battery capacity provided; runtime UNKNOWN."
            : `${input.batteryKwh} kWh ÷ ${shortfallKw} kW = ${runtime} h (ignores losses).`,
    },
    {
      id: "NODAL-NODE-001",
      title: "Selected-node demand allocation",
      status: "TRIGGERED",
      tag: "CONCEPTUAL",
      detail: `${node.id} (${node.type}): ${share} % × ${input.demandKw} kW = ${allocated} kW allocated (SIMULATED). ${nodeNote}`,
    },
    {
      id: "NODAL-OBS-001",
      title: "Regional NOAA observation context",
      status: input.noaaStatus === "unavailable" || input.noaaStatus === "unknown" ? "UNKNOWN" : "TRIGGERED",
      tag: input.noaaStatus === "unavailable" || input.noaaStatus === "unknown" ? "UNKNOWN" : "OBSERVED",
      detail:
        input.noaaStatus === "unavailable" || input.noaaStatus === "unknown"
          ? "No NOAA observation could be retrieved; regional context UNKNOWN."
          : `NOAA station 8723214 retrieval state: ${input.noaaStatus}. Shore-station context only; not the NODAL site and not used in the power calculation.`,
    },
    {
      id: "NODAL-ENV-001",
      title: "Local marine evidence missing",
      status: "TRIGGERED",
      tag: "UNKNOWN",
      detail: `${DATA_GAPS.length} of ${DATA_GAPS.length} required local evidence categories are UNKNOWN: ${DATA_GAPS.map((g) => g.label.toLowerCase()).join(", ")}.`,
    },
    {
      id: "NODAL-ENV-000",
      title: "Energy result does not imply environmental safety",
      status: "TRIGGERED",
      tag: "UNKNOWN",
      detail: "Power balance and ecological suitability are independent questions. No ecological score or threshold is applied.",
    },
  ];

  const action: Assessment["action"] =
    status === "SHORTFALL"
      ? {
          id: "NODAL-ACT-MITIGATE-SHORTFALL",
          tag: "SIMULATED",
          text:
            `Reduce simulated compute demand by at least ${shortfallKw} kW (or raise simulated generation by the same amount) to remove the shortfall.` +
            (runtime !== null ? ` Until then, stored energy would last about ${runtime} h under the stated assumptions.` : " Battery capacity is not set, so runtime is UNKNOWN."),
        }
      : {
          id: "NODAL-ACT-COMMISSION-LOCAL-STUDIES",
          tag: "UNKNOWN",
          text:
            (status === "ZERO_MARGIN" ? "Energy balance has zero headroom in the simulation. " : "Energy balance holds in the simulation. ") +
            "Next: commission local thermal, current, bathymetry, habitat/benthic and permitting studies before any site qualification.",
        };

  const base: Omit<Assessment, "assessmentId"> = {
    schemaVersion: "nodal-assessment/1",
    valid: true,
    errors: [],
    inputs,
    power: {
      netPowerKw: net,
      formula: "netPowerKw = simulatedGenerationKw − simulatedDemandKw",
      energyStatus: status,
      shortfallKw,
      batteryRuntimeHours: runtime,
      batteryRuntimeFormula: shortfallKw !== null ? "batteryRuntimeHours = availableBatteryEnergyKWh / max(0, −netPowerKw)" : null,
      tag: "SIMULATED",
    },
    selectedNode: {
      id: node.id,
      type: node.type,
      label: node.label,
      workloadSharePct: share,
      allocatedDemandKw: allocated,
      note: nodeNote,
      tag: "CONCEPTUAL",
    },
    rules,
    dataGaps: DATA_GAPS,
    assumptions: ASSUMPTIONS,
    action,
    verdict: verdict(),
  };
  return { ...base, assessmentId: fnv1a(JSON.stringify(base)) };
}

function verdict(): Assessment["verdict"] {
  return {
    id: "NODAL-VERDICT-001",
    siteSuitability: "UNDETERMINED",
    deploymentReadiness: "NOT_ESTABLISHED",
    headline: "DO NOT DEPLOY YET",
    basis: `Local marine evidence is UNKNOWN in all ${DATA_GAPS.length} required categories. This prototype cannot establish ecological suitability or engineering safety.`,
  };
}

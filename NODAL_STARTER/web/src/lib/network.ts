import raw from "@/data/network.json";

/**
 * Typed, READ-ONLY view of shared/network.json (copied by scripts/sync-network.mjs).
 * Coordinates: meters, Y up, X east/west, Z north/south. Hypothetical — not geographic.
 */
export type NodeType = "RIDGE" | "CANYON" | "CONNECTOR";

export interface NetNode {
  id: string;
  type: NodeType;
  label: string;
  position: [number, number, number];
  rotationYDeg: number;
  simulatedWorkloadPct: number;
}

export interface SurfaceHub {
  id: string;
  type: "ATOL";
  label: string;
  position: [number, number, number];
}

export interface Junction {
  id: string;
  type: "JUNCTION";
  position: [number, number, number];
}

export interface Connection {
  source: string;
  target: string;
  kind: "UMBILICAL" | "POWER_DATA";
}

export interface NetworkSchema {
  schemaVersion: string;
  project: string;
  coordinateSystem: { unit: string; up: string; description: string };
  provenance: { type: string; notice: string };
  surfaceHub: SurfaceHub;
  seafloorJunction: Junction;
  nodes: NetNode[];
  connections: Connection[];
  visualization: { gltfGroupNaming: string; glbExpectedPath: string };
  notes: string[];
}

export const network = raw as unknown as NetworkSchema;

export type EntityId = string;

export interface Entity {
  id: string;
  type: NodeType | "ATOL" | "JUNCTION";
  label: string;
  position: [number, number, number];
  rotationYDeg: number;
}

/** Every positioned entity in the network, in schema order. */
export const entities: Entity[] = [
  { ...network.surfaceHub, rotationYDeg: 0 },
  { id: network.seafloorJunction.id, type: "JUNCTION", label: "Seafloor Junction", position: network.seafloorJunction.position, rotationYDeg: 0 },
  ...network.nodes.map((n) => ({ id: n.id, type: n.type, label: n.label, position: n.position, rotationYDeg: n.rotationYDeg })),
];

export const entityById = new Map(entities.map((e) => [e.id, e]));
export const nodeById = new Map(network.nodes.map((n) => [n.id, n]));

/** Typed-name used for 3D selection: NODE__<id> */
export const glbGroupName = (id: string) => `NODE__${id}`;

export const TYPE_BLURB: Record<NodeType | "ATOL" | "JUNCTION", string> = {
  RIDGE: "Low-profile protected computing and exterior habitat geometry",
  CANYON: "Tall vertical structure with a serviceable computing spine",
  CONNECTOR: "Network integration and protected cable/service passage (no compute assumed)",
  ATOL: "Proposed surface solar, communications, power management and umbilical hub",
  JUNCTION: "Seafloor power and data distribution point",
};

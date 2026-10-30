"use client";

/**
 * Fallback network visualization (SVG). Always renders from shared/network.json positions.
 * CONCEPTUAL: glyph silhouettes are stylised from the reference boards; sizes are illustrative.
 * Positions come from the frozen schema (meters, Y up). No geographic meaning.
 */
import { KeyboardEvent } from "react";
import { network, type NetNode, type NodeType } from "@/lib/network";

export type ViewMode = "section" | "plan";
export type EnergyStatus = "SHORTFALL" | "ZERO_MARGIN" | "SURPLUS" | "INVALID";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  view: ViewMode;
  /** Allocated simulated demand per node id (kW) — drives core glow only. */
  allocatedKw: Record<string, number>;
  energyStatus: EnergyStatus;
}

const S = 17; // px per meter (illustrative scale)
const GLYPH_SCALE: Record<NodeType, number> = { RIDGE: 1.5, CANYON: 1.15, CONNECTOR: 1 };
const CX = 500;
const X0 = 1; // world x mapped to CX
const tx = (x: number) => CX + (x - X0) * S;
const SEC_WATER_Y = 132;
const secY = (wy: number, z = 0) => SEC_WATER_Y - wy * S - z * 1.6;

/* ---------- organic glyph geometry (local units; base at 0,0; up = negative y) ---------- */
const hole = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

const SHAPES = {
  RIDGE: {
    d:
      "M-34 0C-32-6-26-16-18-24C-14-28-8-27-2-24C8-19 16-14 28-8C36-5 42-2 50 0L42 0C36-2 30-3 24-3C18-3 14-2 10 0L4 0C2-6-2-10-8-10C-14-10-18-6-20 0Z" +
      hole(-14, -18, 3.6, 2.8) + hole(-3, -16.5, 3, 2.2) + hole(9, -10.5, 3, 1.7) + hole(21, -6, 2.6, 1.1) + hole(-26, -6, 1.6, 2),
    twigs: "M-18-24C-21-32-16-38-21-45M-2-24C0-31 6-33 6-39M28-8C32-14 38-14 42-20M-32-4C-38-8-40-14-38-18",
    core: { x: -17, y: -7, w: 19, h: 7, vertical: false },
    hit: { x: -42, y: -48, w: 96, h: 54 },
    labelRow: 1,
  },
  CANYON: {
    d:
      "M-20 0C-26-30-12-56-18-82C-22-104-12-124-8-142C-3-126 0-118 3-112C6-126 12-134 20-140C16-118 18-100 16-84C14-60 26-30 20 0L10 0C11-24 4-44 6-64C8-84 2-92 2-104C-1-92-8-84-8-64C-8-44-12-24-10 0Z" +
      hole(-16, -40, 3, 6) + hole(15, -50, 2.6, 7) + hole(-14, -92, 2.5, 5) + hole(12.5, -96, 2.2, 6) + hole(-13, -64, 2, 4),
    twigs: "M-18-70C-30-76-34-88-32-100M17-76C28-84 32-98 30-112M-12-120C-20-126-22-134-20-140M-18-30C-30-34-34-42-32-50",
    core: { x: -5, y: -90, w: 10, h: 84, vertical: true },
    hit: { x: -38, y: -150, w: 76, h: 158 },
    labelRow: 1,
  },
  CONNECTOR: {
    d:
      "M-66 0C-56-10-34-22-10-17C8-13 24-24 66-3L62 0C42-9 24-5 8-6C-8-7-30-7-60 0Z" +
      hole(-30, -13, 5, 2.2) + hole(-8, -11, 4, 2) + hole(14, -14, 4.5, 2.4) + hole(36, -10, 3, 1.4),
    twigs: "M-10-17C-14-26-22-30-30-31M30-14C34-22 42-26 50-26",
    core: null,
    hit: { x: -72, y: -36, w: 144, h: 42 },
    labelRow: 1,
  },
} as const;

const ATOL_HULL =
  "M-102 2C-92-18-52-32 0-32C52-32 92-18 102 2C60 10-60 10-102 2Z" +
  [-70, -42, -14, 14, 42, 70].map((x) => hole(x, -11, 9, 4.6)).join("");
const ATOL_FINS = [
  "M-62-26C-76-52-66-78-52-92C-48-70-50-46-62-26Z",
  "M62-26C76-52 66-78 52-92C48-70 50-46 62-26Z",
  "M-40-30C-46-46-42-60-34-70C-32-56-34-42-40-30Z",
  "M40-30C46-46 42-60 34-70C32-56 34-42 40-30Z",
];

const PLAN = {
  RIDGE: {
    d: "M-38 0C-26-12-8-16 10-10C22-6 30-12 42-18C36-6 38 4 26 8C12 14-10 14-38 0Z" + hole(-8, -3, 5, 2.4) + hole(14, -2, 3.5, 1.8),
  },
  CANYON: {
    d: starPath([[-90, 30], [-30, 34], [28, 44], [80, 30], [150, 38], [210, 28], [262, 32], [320, 40]], 7) + hole(0, 0, 5, 5),
  },
  CONNECTOR: {
    d: "M-66 0C-40-8-14-6 0-2C12 2 30-10 66-14C40 0 26 8 6 8C-18 10-44 6-66 0Z" + hole(-22, 0, 5, 1.6) + hole(24, -2, 5, 1.8),
  },
} as const;

function starPath(arms: [number, number][], r: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const pts: string[] = [];
  arms.forEach(([ang, len], i) => {
    const next = arms[(i + 1) % arms.length][0];
    const mid = ang + (((next - ang + 360) % 360) / 2);
    pts.push(`${(Math.cos(rad(ang)) * len).toFixed(1)} ${(Math.sin(rad(ang)) * len * 0.6).toFixed(1)}`);
    pts.push(`${(Math.cos(rad(mid)) * r).toFixed(1)} ${(Math.sin(rad(mid)) * r).toFixed(1)}`);
  });
  return `M${pts.join("L")}Z`;
}

/* ---------- glyph renderers ---------- */
function Core({ type, glow }: { type: NodeType; glow: number }) {
  const c = SHAPES[type].core;
  if (!c) return null;
  return (
    <g aria-hidden="true">
      <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={3} fill="var(--core-metal)" stroke="var(--ivory-dim)" strokeWidth={0.6} />
      {c.vertical
        ? [0.2, 0.4, 0.6, 0.8].map((f) => <line key={f} x1={c.x} x2={c.x + c.w} y1={c.y + c.h * f} y2={c.y + c.h * f} stroke="var(--ivory-dim)" strokeWidth={0.5} />)
        : [0.25, 0.5, 0.75].map((f) => <line key={f} y1={c.y} y2={c.y + c.h} x1={c.x + c.w * f} x2={c.x + c.w * f} stroke="var(--ivory-dim)" strokeWidth={0.5} />)}
      <rect x={c.x + 1.2} y={c.y + 1.2} width={c.w - 2.4} height={c.h - 2.4} rx={2} fill="var(--amber)" opacity={0.08 + 0.55 * glow} />
    </g>
  );
}

function NodeGlyph({ type, glow, plan }: { type: NodeType; glow: number; plan?: boolean }) {
  if (plan) {
    return <path d={PLAN[type].d} fill="url(#nodal-bone)" stroke="var(--ivory)" strokeOpacity={0.7} strokeWidth={0.8} strokeLinejoin="round" fillRule="evenodd" />;
  }
  const s = SHAPES[type];
  return (
    <g>
      <path d={s.twigs} fill="none" stroke="var(--ivory-dim)" strokeWidth={1.6} strokeLinecap="round" />
      <Core type={type} glow={glow} />
      <path d={s.d} fill="url(#nodal-bone)" stroke="var(--ivory)" strokeOpacity={0.75} strokeWidth={0.8} fillRule="evenodd" strokeLinejoin="round" />
    </g>
  );
}

function AtolGlyph() {
  return (
    <g aria-hidden="true">
      <path d="M-80 6C-40 16 40 16 80 6L70 22C30 30-30 30-70 22Z" fill="var(--bone-deep)" opacity={0.5} />
      {ATOL_FINS.map((d, i) => (
        <path key={i} d={d} fill="url(#nodal-bone)" stroke="var(--ivory)" strokeOpacity={0.7} strokeWidth={0.7} />
      ))}
      <rect x={-2.2} y={-114} width={4.4} height={84} fill="var(--ivory-dim)" />
      <line x1={-9} x2={9} y1={-92} y2={-92} stroke="var(--ivory-dim)" strokeWidth={1.4} />
      <line x1={-6} x2={6} y1={-78} y2={-78} stroke="var(--ivory-dim)" strokeWidth={1.4} />
      <circle cx={0} cy={-116} r={2.4} fill="var(--ivory)" />
      <path d={ATOL_HULL} fill="url(#nodal-bone)" stroke="var(--ivory)" strokeOpacity={0.8} strokeWidth={0.9} fillRule="evenodd" />
    </g>
  );
}

function cableColor(status: EnergyStatus) {
  return status === "SHORTFALL" ? "var(--amber)" : "var(--ivory-dim)";
}

export default function NetworkView({ selectedId, onSelect, view, allocatedKw, energyStatus }: Props) {
  const nodes = [...network.nodes].sort((a, b) => b.position[2] - a.position[2]); // far (+Z) first
  const maxAlloc = 70;
  const glow = (n: NetNode) => Math.min(1, (allocatedKw[n.id] ?? 0) / maxAlloc);
  const color = cableColor(energyStatus);
  const pos = (id: string): [number, number, number] =>
    id === network.surfaceHub.id ? network.surfaceHub.position : id === network.seafloorJunction.id ? network.seafloorJunction.position : (nodes.find((n) => n.id === id)?.position as [number, number, number]);

  const onKey = (id: string) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };

  const defs = (
    <defs>
      <linearGradient id="nodal-bone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F6F4EA" />
        <stop offset="1" stopColor="#B9B5A4" />
      </linearGradient>
      <linearGradient id="nodal-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0B3340" />
        <stop offset="0.55" stopColor="#07222D" />
        <stop offset="1" stopColor="#04121A" />
      </linearGradient>
      <linearGradient id="nodal-ray" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4FD1D9" stopOpacity="0.16" />
        <stop offset="1" stopColor="#4FD1D9" stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  if (view === "plan") {
    const py = (z: number) => 340 - z * S;
    return (
      <svg viewBox="0 0 1000 460" className="nv" role="group" aria-label="Plan view of the NODAL network, X by Z, from shared/network.json (conceptual layout)">
        {defs}
        <rect width="1000" height="460" fill="url(#nodal-water)" />
        <g stroke="var(--grid)" strokeWidth={1}>
          {Array.from({ length: 11 }, (_, i) => -20 + i * 5).map((x) => (
            <g key={x}>
              <line x1={tx(x)} x2={tx(x)} y1={20} y2={430} />
              <text x={tx(x)} y={446} fill="var(--ivory-dim)" stroke="none" fontSize={15} textAnchor="middle" fontFamily="var(--font-utility)">{x} m</text>
            </g>
          ))}
          {[0, 5, 10, 15].map((z) => (
            <g key={z}>
              <line x1={30} x2={970} y1={py(z)} y2={py(z)} />
              <text x={34} y={py(z) - 5} fill="var(--ivory-dim)" stroke="none" fontSize={15} fontFamily="var(--font-utility)">Z {z}</text>
            </g>
          ))}
        </g>
        {network.connections.map((c) => {
          const a = pos(c.source), b = pos(c.target);
          return <line key={`${c.source}-${c.target}`} x1={tx(a[0])} y1={py(a[2])} x2={tx(b[0])} y2={py(b[2])} stroke={color} strokeWidth={c.kind === "UMBILICAL" ? 2.4 : 1.8} strokeDasharray={c.kind === "UMBILICAL" ? "0" : "7 5"} opacity={0.9} />;
        })}
        <g transform={`translate(${tx(0)} ${py(0)})`} aria-hidden="true">
          <circle r={50} fill="rgba(241,241,233,0.07)" stroke="var(--ivory)" strokeOpacity={0.6} strokeDasharray="4 5" />
          <circle r={14} fill="var(--core-metal)" stroke="var(--ivory-dim)" />
          <text y={-58} textAnchor="middle" fill="var(--ivory)" fontSize={18} fontFamily="var(--font-utility)">ATOL_01 (surface) · JUNCTION_01 (−12 m, beneath)</text>
        </g>
        {nodes.map((n) => {
          const x = tx(n.position[0]), y = py(n.position[2]);
          const sc = n.type === "CANYON" ? 0.5 : 1;
          return (
            <g key={`g-${n.id}`} aria-hidden="true" transform={`translate(${x} ${y}) rotate(${n.rotationYDeg}) scale(${sc})`}>
              <NodeGlyph type={n.type} glow={glow(n)} plan />
            </g>
          );
        })}
        {network.nodes.map((n) => {
          const sel = n.id === selectedId;
          const x = tx(n.position[0]), y = py(n.position[2]);
          return (
            <g key={n.id} role="button" tabIndex={0} aria-pressed={sel} aria-label={`${n.label}, ${n.type}, ${n.id}`} className="nv-node" onClick={() => onSelect(n.id)} onKeyDown={onKey(n.id)}>
              <circle cx={x} cy={y} r={46} fill="transparent" className="nv-hit" />
              {sel && <circle cx={x} cy={y} r={44} fill="none" stroke="var(--ivory)" strokeWidth={2} strokeDasharray="5 4" />}
              <text x={x} y={y + 62} textAnchor="middle" fontSize={20} fontFamily="var(--font-utility)" fill="var(--ivory)" fontWeight={sel ? 700 : 400}>{n.id}</text>
            </g>
          );
        })}
        <text x={970} y={34} textAnchor="end" fontSize={15} fill="var(--ivory-dim)" fontFamily="var(--font-utility)">PLAN · +Z up · rotationYDeg applied · glyph sizes illustrative</text>
      </svg>
    );
  }

  // ---------- section (X–Y) view ----------
  const seabedY = secY(-12);
  const seabed = `M0 ${seabedY + 8}C120 ${seabedY - 6} 200 ${seabedY + 10} 320 ${seabedY + 2}S520 ${seabedY + 14} 640 ${seabedY + 4}S860 ${seabedY - 4} 1000 ${seabedY + 8}L1000 460L0 460Z`;
  const labelY = (row: number) => seabedY + 54 + (row - 1) * 24;
  const rowFor = (id: string) => (id === "CANYON_02" ? 2 : 1);

  return (
    <svg viewBox="0 0 1000 460" className="nv" role="group" aria-label="Section view of the NODAL network, X by Y, from shared/network.json (conceptual layout)">
      {defs}
      <rect width="1000" height="460" fill="url(#nodal-water)" />
      <rect width="1000" height={SEC_WATER_Y} fill="#0A2A37" opacity={0.0} />
      {[170, 330, 560, 760].map((x, i) => (
        <polygon key={x} points={`${x},${SEC_WATER_Y} ${x + 60 + i * 6},${SEC_WATER_Y} ${x + 150},${seabedY} ${x + 70},${seabedY}`} fill="url(#nodal-ray)" />
      ))}
      <path className="nv-wave" d={`M-40 ${SEC_WATER_Y}q30 -7 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0`} fill="none" stroke="var(--cyan)" strokeOpacity={0.5} strokeWidth={1.4} />
      <text x={16} y={SEC_WATER_Y - 8} fontSize={15} fill="var(--ivory-dim)" fontFamily="var(--font-utility)">Y = 0 · arbitrary water-surface plane</text>
      <text x={16} y={seabedY - 8} fontSize={15} fill="var(--ivory-dim)" fontFamily="var(--font-utility)">Y = −12 m</text>
      <path d={seabed} fill="#0E1F22" stroke="var(--ivory-dim)" strokeOpacity={0.35} />

      {/* umbilical (behind canyon) */}
      <path d={`M${tx(0)} ${SEC_WATER_Y + 24}C${tx(0) - 8} ${SEC_WATER_Y + 80} ${tx(0) + 8} ${seabedY - 70} ${tx(0)} ${seabedY}`} fill="none" stroke={color} strokeWidth={3} />
      <text x={tx(0) - 22} y={176} textAnchor="end" fontSize={15} fill="var(--ivory)" fontFamily="var(--font-utility)">UMBILICAL → JUNCTION_01 (Y −12 m)</text>

      {/* seabed power/data links */}
      {network.connections.filter((c) => c.kind === "POWER_DATA").map((c) => {
        const a = pos(c.source), b = pos(c.target);
        const x1 = tx(a[0]), x2 = tx(b[0]);
        const y1 = secY(a[1], a[2]) + 3, y2 = secY(b[1], b[2]) + 3;
        return <path key={`${c.source}-${c.target}`} d={`M${x1} ${y1}Q${(x1 + x2) / 2} ${Math.max(y1, y2) + 14} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="7 5" />;
      })}

      {/* junction pad */}
      <g transform={`translate(${tx(0)} ${seabedY + 2})`} aria-hidden="true">
        <ellipse rx={30} ry={7} fill="var(--core-metal)" stroke="var(--ivory-dim)" />
        <ellipse rx={12} ry={3} fill="var(--amber)" opacity={0.25} />
      </g>

      {nodes.map((n) => (
        <g key={`g-${n.id}`} aria-hidden="true" transform={`translate(${tx(n.position[0])} ${secY(n.position[1], n.position[2])}) scale(${(1 - n.position[2] * 0.004) * GLYPH_SCALE[n.type]})`}>
          <NodeGlyph type={n.type} glow={glow(n)} />
        </g>
      ))}

      {/* ATOL — conceptual surface hub */}
      <g transform={`translate(${tx(0)} ${SEC_WATER_Y})`} aria-hidden="true">
        <AtolGlyph />
      </g>

      {/* interactive layer: schema order = tab order, drawn above glyphs */}
      {network.nodes.map((n) => {
        const sel = n.id === selectedId;
        const x = tx(n.position[0]);
        const y = secY(n.position[1], n.position[2]);
        const sc = (1 - n.position[2] * 0.004) * GLYPH_SCALE[n.type];
        const h = SHAPES[n.type].hit;
        const row = rowFor(n.id);
        return (
          <g key={n.id} role="button" tabIndex={0} aria-pressed={sel} aria-label={`${n.label}, ${n.type}, ${n.id}`} className="nv-node" onClick={() => onSelect(n.id)} onKeyDown={onKey(n.id)}>
            <g transform={`translate(${x} ${y}) scale(${sc})`}>
              <rect x={h.x} y={h.y} width={h.w} height={h.h} rx={10} fill="transparent" className="nv-hit" />
              {sel && <rect x={h.x} y={h.y} width={h.w} height={h.h} rx={10} fill="rgba(241,241,233,0.06)" stroke="var(--ivory)" strokeWidth={1.6 / sc} strokeDasharray="5 4" />}
            </g>
            <line x1={x} x2={x} y1={y + 6} y2={labelY(row) - 15} stroke="var(--ivory-dim)" strokeOpacity={0.45} strokeDasharray="2 3" />
            <text x={x} y={labelY(row)} textAnchor="middle" fontSize={20} fontFamily="var(--font-utility)" fill="var(--ivory)" fontWeight={sel ? 700 : 400}>{n.id}</text>
          </g>
        );
      })}
      <text x={tx(0) + 118} y={SEC_WATER_Y - 54} fontSize={18} fill="var(--ivory)" fontFamily="var(--font-utility)">ATOL_01 · surface hub</text>
      <text x={tx(0) + 118} y={SEC_WATER_Y - 36} fontSize={15} fill="var(--ivory-dim)" fontFamily="var(--font-utility)">CONCEPTUAL</text>
      <text x={984} y={452} textAnchor="end" fontSize={15} fill="var(--ivory-dim)" fontFamily="var(--font-utility)">SECTION · X → · deeper = lower · glyph sizes illustrative · depth cue: +Z drawn higher</text>
    </svg>
  );
}

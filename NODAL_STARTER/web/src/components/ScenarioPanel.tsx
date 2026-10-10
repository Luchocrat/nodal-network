"use client";

import Badge from "./Badge";
import { LIMITS } from "@/lib/scenario";

export interface ScenarioState {
  demandKw: number;
  generationKw: number;
  batteryOn: boolean;
  batteryKwh: number;
}

interface Props {
  value: ScenarioState;
  onChange: (next: ScenarioState) => void;
  onReset: () => void;
}

export default function ScenarioPanel({ value, onChange, onReset }: Props) {
  const set = (patch: Partial<ScenarioState>) => onChange({ ...value, ...patch });
  return (
    <section className="panel" aria-labelledby="scn-h">
      <header>
        <h2 id="scn-h">Network scenario</h2>
        <Badge tag="SIMULATED" />
      </header>
      <p className="small dim" style={{ margin: "0 0 4px" }}>
        Network-wide illustrative inputs for a hypothetical network. Nothing here is measured at any installation; node selection only changes which share is displayed.
      </p>

      <div className="field">
        <label htmlFor="demand">
          <span>Compute demand · network-wide (simulated)</span>
          <span className="val">{value.demandKw}<small>kW</small></span>
        </label>
        <input id="demand" type="range" {...LIMITS.demandKw} value={value.demandKw} aria-valuetext={`${value.demandKw} kilowatts, simulated network demand`} onChange={(e) => set({ demandKw: Number(e.target.value) })} />
      </div>

      <div className="field">
        <label htmlFor="gen">
          <span>Renewable generation (simulated)</span>
          <span className="val">{value.generationKw}<small>kW</small></span>
        </label>
        <input id="gen" type="range" {...LIMITS.generationKw} value={value.generationKw} aria-valuetext={`${value.generationKw} kilowatts, simulated renewable generation`} onChange={(e) => set({ generationKw: Number(e.target.value) })} />
      </div>

      <div className="field">
        <div className="lab">
          <label htmlFor="batt-on" style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <input id="batt-on" type="checkbox" checked={value.batteryOn} onChange={(e) => set({ batteryOn: e.target.checked })} style={{ width: 20, height: 20, accentColor: "var(--amber)" }} />
            Usable battery capacity (optional, simulated)
          </label>
        </div>
        <div className="numin">
          <label htmlFor="batt" className="sr-only">Usable battery energy in kilowatt-hours</label>
          <input id="batt" type="number" inputMode="decimal" min={LIMITS.batteryKwh.min} max={LIMITS.batteryKwh.max} step={LIMITS.batteryKwh.step} disabled={!value.batteryOn} value={value.batteryKwh} onChange={(e) => { if (e.target.value === "") return; const n = Number(e.target.value); if (Number.isFinite(n)) set({ batteryKwh: Math.min(LIMITS.batteryKwh.max, Math.max(LIMITS.batteryKwh.min, n)) }); }} />
          <span className="mono dim">kWh</span>
          {!value.batteryOn && <span className="small dim">not set → runtime UNKNOWN</span>}
        </div>
      </div>

      <button type="button" className="btn ghost" onClick={onReset}>Reset scenario</button>
    </section>
  );
}

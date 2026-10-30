"use client";

import Badge from "./Badge";
import type { Assessment } from "@/lib/scenario";

export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0");

/** Rail core: net result, battery line, recommended action, suitability. Same `a` prop, no logic change. */
export function AssessmentCore({ a }: { a: Assessment }) {
  const net = a.power.netPowerKw;
  const status = a.power.energyStatus;
  return (
    <section className="rail-sec" aria-labelledby="asm-h">
      <header>
        <h2 id="asm-h">Illustrative power balance &amp; next action</h2>
      </header>

      <div aria-live="polite" aria-atomic="true">
        <div className="net">
          <span className={`n ${net !== null && net < 0 ? "neg" : ""}`} aria-label={net === null ? "not computed" : `${net < 0 ? "negative " : ""}${Math.abs(net)} kilowatts net power`}>
            {net === null ? "—" : signed(net)}
          </span>
          <span className="u">kW net power</span>
          <span className={`state-pill ${status}`}>{status === "SHORTFALL" ? "▼ SHORTFALL" : status === "ZERO_MARGIN" ? "ZERO MARGIN" : status === "SURPLUS" ? "SURPLUS" : "INVALID"}</span>
          <Badge tag="SIMULATED" />
        </div>
        {a.power.batteryRuntimeHours !== null && (
          <div className="mono small" style={{ marginTop: 6 }}>
            Battery runtime ≈ <strong>{a.power.batteryRuntimeHours} h</strong> <span className="dim">(optional, ignores losses)</span> <Badge tag="SIMULATED" />
          </div>
        )}

        <div className={`action ${status === "SHORTFALL" ? "short" : ""}`}>
          <div className="k">Recommended operational action <span className="dim">· {a.action.id}</span></div>
          <p>{a.action.text}</p>
        </div>
      </div>

      <div className="suit" role="status">
        <div className="h">
          Site ecological suitability: <strong>undetermined</strong> <Badge tag="UNKNOWN" />
        </div>
        <p>
          Do not deploy yet. {a.dataGaps.length} local evidence categories are unknown, whatever the power balance. This prototype cannot establish ecological suitability or engineering safety.
        </p>
        <p className="scope">Power calculation uses simulated inputs; NOAA provides separate regional context.</p>
      </div>
    </section>
  );
}

/** Ledger half: assessment ID, formula, rules triggered, and the three details. */
export function AssessmentLedger({ a }: { a: Assessment }) {
  return (
    <div className="asm-ledger">
      <div className="mono small dim" title="Same inputs always produce the same assessment ID">Assessment {a.assessmentId}</div>
      <div className="mono small dim">{a.power.formula}</div>

      <div className="mono small" style={{ marginTop: 10 }}>
        <span className="dim">Rules triggered: </span>
        {a.rules.filter((r) => r.status === "TRIGGERED").map((r) => r.id).join(" · ")}
        <span className="dim"> · verdict {a.verdict.id}</span>
      </div>

      <details>
        <summary>Missing local evidence ({a.dataGaps.length} categories)</summary>
        <ul className="gaps">
          {a.dataGaps.map((g) => (
            <li key={g.id}>
              <Badge tag="UNKNOWN" />
              <span><strong>{g.label}.</strong> <span className="dim">{g.why}</span></span>
            </li>
          ))}
        </ul>
      </details>

      <details>
        <summary>Rules evaluated ({a.rules.length}) · stable IDs</summary>
        <ul className="rules">
          {a.rules.map((r) => (
            <li key={r.id} className={r.status === "NOT_TRIGGERED" ? "off" : ""}>
              <span className="rid">{r.id}</span>
              <span><strong>{r.title}</strong> — <span className="dim">{r.status.replace("_", " ").toLowerCase()}.</span> {r.detail}</span>
            </li>
          ))}
        </ul>
      </details>

      <details>
        <summary>Assumptions ({a.assumptions.length})</summary>
        <ul className="small dim">{a.assumptions.map((x) => <li key={x}>{x}</li>)}</ul>
      </details>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AssessmentCore, AssessmentLedger, signed } from "./AssessmentPanel";
import ConceptFilm from "./ConceptFilm";
import GemmaPanel from "./GemmaPanel";
import NoaaPanel, { NoaaStrip, type NoaaState } from "./NoaaPanel";
import Badge from "./Badge";
import NetworkView, { type ViewMode } from "./NetworkView";
import ScenarioPanel, { type ScenarioState } from "./ScenarioPanel";
import Wordmark from "./Wordmark";
import { network, TYPE_BLURB } from "@/lib/network";
import { DEFAULTS, runAssessment } from "@/lib/scenario";
import type { NoaaResponse } from "@/lib/noaa-types";

function SelectedNode({ nodeId, demandKw, allocatedKw }: { nodeId: string; demandKw: number; allocatedKw: number }) {
  const n = network.nodes.find((x) => x.id === nodeId);
  if (!n) return null;
  const connector = n.type === "CONNECTOR";
  return (
    <div className="selected" role="status" aria-live="polite">
      <div className="fam">
        <strong className="fam-name">NODAL / {n.type}</strong> · <span className="mono">{n.id}</span> · {n.label} <Badge tag="CONCEPTUAL" />
      </div>
      <div className="alloc">
        {connector ? (
          <>Inspection only: connectors are not assumed to host compute (illustrative share 0%).</>
        ) : (
          <>
            Illustrative allocation: <strong className="mono">{allocatedKw} kW</strong> <Badge tag="SIMULATED" /> <span className="dim">= {n.simulatedWorkloadPct}% of network demand ({demandKw} kW)</span>
          </>
        )}
      </div>
      <div className="small dim">{TYPE_BLURB[n.type]}. Not a node sensor reading or hardware capacity; NOAA context is shared and regional.</div>
    </div>
  );
}

const INITIAL: ScenarioState = { demandKw: DEFAULTS.demandKw, generationKw: DEFAULTS.generationKw, batteryOn: true, batteryKwh: DEFAULTS.batteryKwh ?? 0 };

export default function Dashboard() {
  const [nodeId, setNodeId] = useState("RIDGE_01");
  const [view, setView] = useState<ViewMode>("section");
  const [scn, setScn] = useState<ScenarioState>(INITIAL);

  const [noaa, setNoaa] = useState<NoaaState>({ phase: "loading", data: null });
  const loadNoaa = useCallback(async (refresh = false) => {
    setNoaa((s) => ({ ...s, phase: "loading" }));
    try {
      const r = await fetch(`/api/noaa${refresh ? "?refresh=1" : ""}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setNoaa({ phase: "ready", data: (await r.json()) as NoaaResponse });
    } catch (e) {
      setNoaa((s) => ({ phase: "error", data: s.data, error: e instanceof Error ? e.message : "request failed" }));
    }
  }, []);
  useEffect(() => { void loadNoaa(); }, [loadNoaa]);

  const batteryKwh = scn.batteryOn ? scn.batteryKwh : null;
  const assessment = useMemo(
    () => runAssessment({ demandKw: scn.demandKw, generationKw: scn.generationKw, batteryKwh, nodeId, noaaStatus: noaa.data?.overall ?? "unknown" }),
    [scn.demandKw, scn.generationKw, batteryKwh, nodeId, noaa.data?.overall],
  );
  const explainRequest = useMemo(() => ({ demandKw: scn.demandKw, generationKw: scn.generationKw, batteryKwh, nodeId }), [scn.demandKw, scn.generationKw, batteryKwh, nodeId]);

  const allocatedKw = useMemo(
    () => Object.fromEntries(network.nodes.map((n) => [n.id, (scn.demandKw * n.simulatedWorkloadPct) / 100])),
    [scn.demandKw],
  );

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to dashboard</a>
      <header className="top">
        <Wordmark />
        <div className="top-sub">
          <p className="task">Select a computing node, then adjust simulated demand.</p>
          <div>
            For Miami marine researchers, coastal-resilience teams and planners screening <strong>proposed</strong> ocean infrastructure. Environmental accountability precedes deployment. Not an operating data center, not a validated restoration technology, not a deployment certification.
          </div>
          <div className="motto"><span className="mono">COMPUTE · CLEAN · RESTORE · CONNECT</span> is an aspiration, not proof.</div>
        </div>
      </header>

      <NoaaStrip state={noaa} />

      <nav aria-label="Guided path" className="path">
        <ol>
          <li><a href="#net-h"><span className="mono">01</span> Network</a></li>
          <li><a href="#nodesel"><span className="mono">02</span> Select node</a></li>
          <li><a href="#noaa-h"><span className="mono">03</span> Observe</a></li>
          <li><a href="#scn-h"><span className="mono">04</span> Simulate</a></li>
          <li><a href="#asm-h"><span className="mono">05</span> Action</a></li>
          <li><a href="#gem-h"><span className="mono">06</span> Explain</a></li>
        </ol>
      </nav>

      <main id="main">
        <div className="stage">
          <section className="panel stratum s-net" aria-labelledby="net-h">
            <header>
              <div className="net-title">
                <h2 id="net-h">Network</h2>
                <span className="net-sub">6 nodes + ATOL + seabed junction</span>
              </div>
              <span className="net-controls">
                <Badge tag="CONCEPTUAL" />
                <span className={`state-pill ${assessment.power.energyStatus}`} title="Cables turn amber when the simulated balance is a shortfall; node core glow follows allocated simulated demand">
                  NET {assessment.power.netPowerKw === null ? "—" : `${signed(assessment.power.netPowerKw)} kW`} · SIMULATED
                </span>
                <span className="state-pill">Site suitability: undetermined</span> <Badge tag="UNKNOWN" />
                <span className="seg" role="group" aria-label="Network view">
                  {(["section", "plan"] as const).map((v) => (
                    <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
                      {v === "section" ? "SECTION" : "PLAN"}
                    </button>
                  ))}
                </span>
                <a className="film-link" href="#film-h"><span className="mono">▶</span> Concept film · 47 s</a>
              </span>
            </header>

            <NetworkView selectedId={nodeId} onSelect={setNodeId} view={view} allocatedKw={allocatedKw} energyStatus={assessment.power.energyStatus} />
          </section>

          <div className="s-sel">
            <SelectedNode nodeId={nodeId} demandKw={scn.demandKw} allocatedKw={allocatedKw[nodeId] ?? 0} />

            <h3 id="nodesel" className="subhead">Select a computing node</h3>
            <ul className="nodelist" aria-labelledby="nodesel">
              {network.nodes.map((n) => (
                <li key={n.id}>
                  <button type="button" aria-pressed={n.id === nodeId} onClick={() => setNodeId(n.id)}>
                    <span className="id">{n.id}</span>
                    <span className="meta">{n.label} · {n.type}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="small dim" style={{ margin: "12px 0 0" }}>
              Concept visualization; unvalidated. Positions are hypothetical scene units, not deployment sites. ATOL and the seabed junction are supporting infrastructure, not extra compute nodes.
            </p>
            <details>
              <summary>Schema and view notes</summary>
              <p className="small dim">{network.provenance.notice} Coordinates: {network.coordinateSystem.description} Schema v{network.schemaVersion}. Glyph sizes are illustrative; Section view draws +Z slightly higher as a depth cue; cable colour is amber during a simulated shortfall and node core glow follows simulated allocation. It is not thermal modelling or telemetry.</p>
            </details>
          </div>

          <div className="s-rail">
            <ScenarioPanel value={scn} onChange={setScn} onReset={() => setScn(INITIAL)} />
            <AssessmentCore a={assessment} />
          </div>

          <div className="s-ai">
            <GemmaPanel request={explainRequest} assessment={assessment} onExplained={() => loadNoaa()} />
          </div>

          <ConceptFilm />
        </div>

        <section className="ledger" aria-labelledby="ledger-h">
          <h2 id="ledger-h">Evidence ledger</h2>
          <div className="ledger-grid">
            <NoaaPanel state={noaa} onRefresh={() => void loadNoaa(true)} />
            <AssessmentLedger a={assessment} />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="motto-line">COMPUTING SHOULDN’T SIMPLY MOVE INTO THE OCEAN. IT SHOULD BE ACCOUNTABLE TO THE OCEAN.</div>
        <div>
          Labels: <Badge tag="OBSERVED" /> external measurement (NOAA shore station) · <Badge tag="SIMULATED" /> user scenario · <Badge tag="CONCEPTUAL" /> architecture concept, unvalidated · <Badge tag="UNKNOWN" /> evidence not available.
        </div>
        <div>
          Data: <a href="https://tidesandcurrents.noaa.gov/stationhome.html?id=8723214" target="_blank" rel="noreferrer">NOAA CO-OPS Virginia Key 8723214</a> · AI: Gemma 4 via the <a href="https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api" target="_blank" rel="noreferrer">Gemini API</a> · Layout: <code>shared/network.json</code> v{network.schemaVersion} (hypothetical coordinates, not geographic).
          Reference-board illustrations are concept art, not engineering drawings. Concept film: AI-generated video (Seedance), edited in Remotion.
        </div>
      </footer>
    </div>
  );
}

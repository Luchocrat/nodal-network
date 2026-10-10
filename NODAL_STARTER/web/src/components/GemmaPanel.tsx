"use client";

import { useCallback, useEffect, useState } from "react";
import type { ExplainRequest, ExplainResult } from "@/lib/gemma-types";
import type { Assessment } from "@/lib/scenario";
import { deterministicExplanation } from "@/lib/explain-local";

type Phase = { kind: "idle" } | { kind: "loading" } | { kind: "done"; result: ExplainResult; forKey: string; forReq: ExplainRequest } | { kind: "error"; message: string };
interface Status { configured: boolean; model: string; modelAvailable: boolean | null; detail?: string }

const REASON_TITLE: Record<string, string> = {
  invalid_input: "Invalid scenario input",
  invalid_key: "API key rejected",
  permission_denied: "Permission denied",
  model_not_found: "Model not found for this key",
  quota: "Quota / rate limit",
  rate_limited_local: "Local rate limit",
  timeout: "Timed out",
  network_error: "Network error",
  upstream_error: "Gemini API error",
  empty_response: "Empty response",
};

function LocalExplanation({ a, why }: { a: Assessment; why: string }) {
  return (
    <div className="banner info" style={{ marginTop: 12 }} data-deterministic-explanation="true">
      <strong>GEMMA 4 UNAVAILABLE — {why}</strong>
      <div className="mono small" style={{ margin: "6px 0" }}>DETERMINISTIC EXPLANATION · computed by NODAL rules from the assessment above · not AI, not an observation</div>
      {deterministicExplanation(a).map((s) => (
        <div key={s.heading} style={{ marginTop: 8 }}>
          <div className="mono small dim">{s.heading}</div>
          <ul className="small" style={{ margin: "2px 0 0", paddingLeft: 18 }}>{s.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

type CtxProduct = { product: string; state?: string; observedAtUtc?: string };
const utc = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" }).format(new Date(iso));
/** Observation times of the NOAA context actually sent to Gemma (from the audited payload). */
function contextUsed(payload: unknown): string | null {
  const products = (payload as { observedContext?: { products?: CtxProduct[] } } | undefined)?.observedContext?.products;
  const wl = products?.find((p) => p.product === "water_level");
  if (!wl?.observedAtUtc) return null;
  return `NOAA observed ${utc(wl.observedAtUtc)} (water level${wl.state === "cached" ? ", CACHED" : ""})`;
}

export default function GemmaPanel({ request, assessment, onExplained }: { request: ExplainRequest; assessment: Assessment; onExplained?: () => void }) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [status, setStatus] = useState<Status | null>(null);
  const key = JSON.stringify(request);

  useEffect(() => {
    let live = true;
    fetch("/api/explain", { cache: "no-store" }).then((r) => r.json()).then((s: Status) => live && setStatus(s)).catch(() => live && setStatus(null));
    return () => { live = false; };
  }, []);

  const run = useCallback(async () => {
    setPhase({ kind: "loading" });
    try {
      const r = await fetch("/api/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
      const result = (await r.json()) as ExplainResult;
      setPhase({ kind: "done", result, forKey: JSON.stringify(request), forReq: request });
      // Re-sync the NOAA strip with the payload Gemma received (server cache returns the same data).
      if (result.state === "success") onExplained?.();
    } catch (e) {
      setPhase({ kind: "error", message: e instanceof Error ? e.message : "Request failed" });
    }
  }, [request, onExplained]);

  const done = phase.kind === "done" ? phase : null;
  const outdated = done && done.forKey !== key;

  return (
    <section className="panel" aria-labelledby="gem-h">
      <header>
        <h2 id="gem-h">AI explanation · Gemma 4</h2>
        <span className="mono small dim">{status?.model ?? "gemma-4-26b-a4b-it"} · via Gemini API (server-side)</span>
      </header>
      <p className="small dim" style={{ margin: "0 0 10px" }}>
        <strong className="aitag">AI EXPLANATION</strong> Derived from the assessment above; it is not an observation. It does not calculate and cannot certify ecological safety.
        {status && !status.configured && <> <strong style={{ color: "var(--amber)" }}>Not configured on this server.</strong></>}
        {status?.configured && status.modelAvailable === true && <> Model reachable for this key.</>}
        {status?.configured && status.modelAvailable === false && <> <strong style={{ color: "var(--amber)" }}>{status.detail}</strong></>}
      </p>

      <button type="button" className="btn" onClick={run} disabled={phase.kind === "loading"}>
        {phase.kind === "loading" ? "Asking Gemma 4…" : "Explain this assessment"}
      </button>

      <div aria-live="polite">
        {phase.kind === "loading" && <div className="banner info" style={{ marginTop: 12 }}><span className="spinner" aria-hidden="true" />Sending the structured assessment JSON to Gemma 4…</div>}

        {phase.kind === "error" && <div className="banner" role="alert" style={{ marginTop: 12 }}>FAILED — could not reach this app’s explain route: {phase.message}. No AI explanation was generated.</div>}
        {phase.kind === "error" && <LocalExplanation a={assessment} why="this app’s explain route could not be reached." />}

        {done?.result.state === "success" && outdated && (
          <div className="banner" style={{ marginTop: 12 }}>
            <strong>OUTDATED.</strong> The scenario or node changed after this explanation was generated (it described {done.forReq.nodeId}, demand {done.forReq.demandKw} kW, generation {done.forReq.generationKw} kW). It is hidden so it is not read as the current result. Select “Explain this assessment” for a new one.
          </div>
        )}

        {done?.result.state === "success" && !outdated && (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
              <span className="mono small aitag">AI EXPLANATION · generated by {done.result.model}</span>
              <span className="mono small dim">{(done.result.latencyMs / 1000).toFixed(1)} s</span>
            </div>
            <div className="gemma-out" lang="en" data-ai-explanation="true">{done.result.text}</div>
            {contextUsed(done.result.payload) && <p className="mono small dim" style={{ margin: "6px 0 0" }}>Regional context used: {contextUsed(done.result.payload)}</p>}
            {!done.result.checks.hasUncertaintySection && <div className="banner" role="alert" style={{ marginTop: 10 }}>Warning: this response has no explicit uncertainty section. Do not rely on it.</div>}
            <p className="small dim">Derived text about simulated inputs and regional context; may contain errors. Response checks — uncertainty section: {done.result.checks.hasUncertaintySection ? "present" : "MISSING"}; cites rule IDs: {done.result.checks.citesRuleIds ? "yes" : "no"}.</p>
          </>
        )}

        {done?.result.state === "success" && outdated && (
          <details>
            <summary>Show previous explanation (outdated, for earlier inputs)</summary>
            <div className="gemma-out stale" lang="en">{done.result.text}</div>
          </details>
        )}

        {done?.result.state === "unavailable" && (
          <div className="banner" role="alert" style={{ marginTop: 12 }}>
            <strong>UNAVAILABLE — Gemma 4 was not called.</strong> {done.result.message}
            <ol className="small" style={{ margin: "8px 0 0", paddingLeft: 20 }}>{done.result.setup.map((s) => <li key={s}>{s}</li>)}</ol>
          </div>
        )}
        {done?.result.state === "unavailable" && !outdated && <LocalExplanation a={assessment} why="no API key on this server." />}
        {done?.result.state === "failed" && !outdated && <LocalExplanation a={assessment} why="the model call failed (see below)." />}

        {done?.result.state === "failed" && (
          <div className="banner" role="alert" style={{ marginTop: 12 }}>
            <strong>FAILED — {REASON_TITLE[done.result.reason] ?? done.result.reason}{done.result.httpStatus ? ` (HTTP ${done.result.httpStatus})` : ""}.</strong> {done.result.message}
            {done.result.availableGemmaModels && (
              <div className="small">Gemma models visible to this key: {done.result.availableGemmaModels.length ? done.result.availableGemmaModels.join(", ") : "none"}. Set <code>GEMMA_MODEL</code> accordingly.</div>
            )}
            <div className="small">No explanation was generated.</div>
          </div>
        )}
      </div>

      {done?.result.payload != null && (
        <details>
          <summary>{done.result.state === "success" ? "Exact JSON sent to Gemma" : "JSON that would be / was sent"}</summary>
          <pre className="json">{JSON.stringify(done.result.payload, null, 2)}</pre>
        </details>
      )}
    </section>
  );
}

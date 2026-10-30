"use client";

import { useEffect, useState } from "react";
import Badge from "./Badge";
import { STALE_AFTER_MIN, type NoaaProductResult, type NoaaResponse } from "@/lib/noaa-types";

/** Client clock, ticking every 60 s so "min old" does not freeze at retrieval time. null until mounted. */
export function useNowMs(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

type Obs = NonNullable<NoaaProductResult["observation"]>;
/** Age/stale recomputed from the observation time; falls back to the value at retrieval before mount. */
export function liveAge(o: Obs, now: number | null): { age: number; stale: boolean } {
  const age = now === null ? o.ageMinutes : Math.max(0, Math.round((now - Date.parse(o.observedAtUtc)) / 60000));
  return { age, stale: age > STALE_AFTER_MIN };
}

export interface NoaaState {
  phase: "loading" | "ready" | "error";
  /** Last successfully received response; retained (and labelled) if a later refresh fails. */
  data: NoaaResponse | null;
  error?: string;
}

const fmt = (iso: string, tz: "UTC" | "America/New_York") =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" }).format(new Date(iso));

const minus = (v: number | string) => (typeof v === "number" && v < 0 ? `−${Math.abs(v)}` : String(v));

const REASON: Record<string, string> = {
  not_offered: "No data returned for this request",
  rate_limited: "Rate limited by NOAA",
  network_error: "Network outage",
  timeout: "Timed out",
  bad_response: "Unexpected NOAA response",
  http_error: "HTTP error from NOAA",
};

/** One freshness/retrieval headline, shared by the top strip and the full panel so they cannot disagree. */
export type Freshness = { key: "loading" | "fromNoaa" | "old" | "partial" | "cached" | "refreshFailed" | "unavailable"; label: string; tone: string; detail?: string };

export function freshness(state: NoaaState, now: number | null = null): Freshness {
  const d = state.data;
  if (!d) {
    return state.phase === "loading"
      ? { key: "loading", label: "FETCHING NOAA…", tone: "var(--muted)" }
      : { key: "unavailable", label: "UNAVAILABLE", tone: "var(--unknown)", detail: "No observation could be retrieved; regional context is UNKNOWN." };
  }
  const shown = d.products.filter((p) => p.observation);
  const oldest = shown.reduce<NoaaProductResult | null>((a, p) => (!a || (liveAge(p.observation!, now).age > liveAge(a.observation!, now).age) ? p : a), null);
  const anyStale = shown.some((p) => liveAge(p.observation!, now).stale);
  if (state.phase === "error") {
    const t = oldest?.observation ? fmt(oldest.observation.observedAtUtc, "UTC") : "";
    return { key: "refreshFailed", label: "REFRESH FAILED — PREVIOUS READINGS", tone: "var(--amber)", detail: `The latest refresh failed${state.error ? ` (${state.error})` : ""}. Previous readings remain on screen with their original observation times${t ? ` (observed ${t})` : ""}.` };
  }
  if (d.overall === "unavailable") return { key: "unavailable", label: "UNAVAILABLE", tone: "var(--unknown)", detail: "NOAA could not be reached and no cached observation exists. Regional context is UNKNOWN." };
  if (d.overall === "cached") return { key: "cached", label: "CACHED — NOT LIVE", tone: "var(--amber)", detail: "NOAA could not be reached. Showing the last cached observations, labelled with their original times." };
  if (anyStale) return { key: "old", label: "FETCHED FROM NOAA · OBSERVATION OLD", tone: "var(--amber)", detail: `Retrieval succeeded, but the newest observation NOAA returned is ${liveAge(oldest!.observation!, now).age} min old. Retrieval now does not mean observation now.` };
  if (d.overall === "partial") return { key: "partial", label: "FETCHED FROM NOAA · PARTIAL", tone: "var(--amber)", detail: "Some products were retrieved; others were unavailable for this request." };
  return { key: "fromNoaa", label: "FETCHED FROM NOAA", tone: "var(--cyan)" };
}

function Card({ p, now }: { p: NoaaProductResult; now: number | null }) {
  const o = p.observation;
  const la = o ? liveAge(o, now) : null;
  return (
    <article className={`obs ${o && p.state === "fetched" && la && !la.stale ? "live" : ""}`} aria-label={p.label}>
      <div className="lab">
        <span>{p.label}</span>
        {o ? <Badge tag="OBSERVED" /> : <Badge tag="UNKNOWN" />}
      </div>

      {o ? (
        <>
          {o.values.length === 1 ? (
            <div className="v">{minus(o.values[0].value)}<small>{o.values[0].unit}{p.product === "water_level" ? " above MLLW" : ""}</small></div>
          ) : (
            <dl className="multi">
              {o.values.map((v, i) => (
                <div key={v.key} className={i === 0 ? "main" : ""}>
                  <dt>{v.label}</dt>
                  <dd>{minus(v.value)}<small>{v.unit}</small></dd>
                </div>
              ))}
            </dl>
          )}
          <div className="ts">Observed {fmt(o.observedAtUtc, "UTC")} · {fmt(o.observedAtUtc, "America/New_York")}</div>
          <div className="ts">
            <strong style={{ color: p.state === "cached" || la!.stale ? "var(--amber)" : "var(--muted)" }}>
              {p.state === "cached" ? "CACHED" : la!.stale ? "OLD OBSERVATION" : "Fetched from NOAA"}
            </strong>{" "}
            · {la!.age} min old{now === null ? " at retrieval" : ""} · retrieved {p.retrievedAtUtc ? fmt(p.retrievedAtUtc, "UTC") : "n/a"}
          </div>
          {o.quality && <div className="ts">NOAA quality q={o.quality} ({o.quality === "p" ? "preliminary" : o.quality === "v" ? "verified" : "see NOAA docs"})</div>}
          {p.caveat && <div className="note">{p.caveat}</div>}
          {p.state === "cached" && (
            <div className="note" style={{ color: "var(--amber)" }}>
              Live request failed: {REASON[p.reason ?? ""] ?? p.reason}. This is the last cached reading.
            </div>
          )}
        </>
      ) : (
        <>
          <div className="v na">— unavailable</div>
          <div className="note">Unavailable for this request. No value is shown, and none is assumed.</div>
          {p.caveat && <div className="note">{p.caveat}</div>}
          <details>
            <summary>Diagnostics</summary>
            <div className="note">{REASON[p.reason ?? ""] ?? p.reason}. {p.message}</div>
          </details>
        </>
      )}
      <a className="small mono" href={p.sourceUrl} target="_blank" rel="noreferrer" aria-label={`NOAA API request for ${p.label}, opens in a new tab`}>NOAA source ↗</a>
    </article>
  );
}

export default function NoaaPanel({ state, onRefresh }: { state: NoaaState; onRefresh: () => void }) {
  const d = state.data;
  const now = useNowMs();
  const f = freshness(state, now);
  return (
    <section className="panel stratum" aria-labelledby="noaa-h">
      <header>
        <h2 id="noaa-h">Regional observations · NOAA Tides &amp; Currents</h2>
        <span style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="mono small" style={{ color: f.tone, fontWeight: 700 }}>● {f.label}</span>
          <button className="btn ghost" type="button" onClick={onRefresh} disabled={state.phase === "loading"}>
            {state.phase === "loading" ? "Refreshing…" : "Refresh"}
          </button>
        </span>
      </header>

      <p className="small dim" style={{ margin: "0 0 12px" }}>
        {d ? `${d.station.name}, FL · station ${d.station.id}` : "Virginia Key, FL · station 8723214"}. Regional shore-station context shared by every node. It is <strong>not</strong> a NODAL sensor, not a reading at the selected node, and not a thermal or current model of any site.
      </p>

      {state.phase === "loading" && !d && <div className="banner info"><span className="spinner" aria-hidden="true" />Fetching NOAA observations for Virginia Key…</div>}
      {f.detail && f.key !== "fromNoaa" && <div className="banner" role="alert">{f.detail}</div>}

      {d && (
        <div className="obs-grid">
          {d.products.filter((p) => p.product !== "currents").map((p) => <Card key={p.product} p={p} now={now} />)}
        </div>
      )}

      <p className="small dim" style={{ margin: "14px 0 0" }}>
        Source: <a href={d?.stationUrl ?? "https://tidesandcurrents.noaa.gov/stationhome.html?id=8723214"} target="_blank" rel="noreferrer">NOAA CO-OPS station 8723214</a> via the <a href={d?.apiDocsUrl ?? "https://api.tidesandcurrents.noaa.gov/api/prod/"} target="_blank" rel="noreferrer">CO-OPS Data API</a>. Metric units; times shown in UTC and Miami local. Tide height is not current speed.
        {d && <> Response assembled {fmt(d.responseAtUtc, "UTC")}.</>}
      </p>
    </section>
  );
}

/** Waterline: same data, same freshness headline, links to the full panel. */
export function NoaaStrip({ state }: { state: NoaaState }) {
  const d = state.data;
  const now = useNowMs();
  const f = freshness(state, now);
  const items = ["water_temperature", "water_level"].map((id) => d?.products.find((p) => p.product === id));
  // one observed-time label when both readings share a timestamp; otherwise one per reading
  const times = items.filter((p) => p?.observation).map((p) => p!.observation!.observedAtUtc);
  const sameTime = times.length > 0 && times.every((t) => t === times[0]);
  const flag = (p: NoaaProductResult) => (p.state === "cached" ? " · CACHED" : liveAge(p.observation!, now).stale ? ` · OLD (${liveAge(p.observation!, now).age} min)` : "");
  const warn = (p: NoaaProductResult) => p.state === "cached" || liveAge(p.observation!, now).stale;
  return (
    <a className="strip" href="#noaa-h">
      <span className="sr-only">Jump to NOAA details. </span>
      <span className="wl-meta">Virginia Key, Miami · 8723214 · regional shore station</span>
      {items.map((p, i) =>
        p?.observation ? (
          <span key={p.product} className="sv">
            <span className="lab">{p.label}</span>
            <strong>{minus(p.observation.values[0].value)}</strong>
            <span className="unit">{p.observation.values[0].unit}{p.product === "water_level" ? " MLLW" : ""}</span>
          </span>
        ) : (
          <span key={items.length + i} className="sv"><span className="lab">{i === 0 ? "Water temperature" : "Water level"}</span> <strong style={{ color: "var(--unknown)" }}>—</strong> <span className="unit">{f.key === "loading" ? "fetching…" : "unavailable"}</span></span>
        ),
      )}
      <span className="wl-right">
        {sameTime
          ? <span style={{ color: items.some((p) => p?.observation && warn(p)) ? "var(--amber)" : "var(--muted)" }}>observed {fmt(times[0], "UTC")}{items.map((p) => (p?.observation ? flag(p) : "")).find((x) => x) ?? ""}</span>
          : items.map((p) => p?.observation && (
              <span key={p.product} style={{ color: warn(p) ? "var(--amber)" : "var(--muted)" }}>{p.label}: observed {fmt(p.observation.observedAtUtc, "UTC")}{flag(p)}</span>
            ))}
        <span style={{ color: f.tone, fontWeight: 600 }}>● {f.label}</span>
        <Badge tag={d && d.products.some((p) => p.observation) ? "OBSERVED" : "UNKNOWN"} />
      </span>
    </a>
  );
}

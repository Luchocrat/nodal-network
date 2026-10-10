import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { STALE_AFTER_MIN } from "./noaa-types";
import type { FailureReason, NoaaProductResult, NoaaResponse, ObservedValue, ProductId } from "./noaa-types";

/**
 * NOAA CO-OPS Tides & Currents adapter — Virginia Key, FL (station 8723214).
 *
 * Products VERIFIED against this station on 2026-10-10 (datagetter, date=latest):
 *   water_temperature ✓  water_level ✓  wind ✓  air_temperature ✓  air_pressure ✓
 *   currents ✗ ("Wrong Station ID")  conductivity ✗  salinity ✗ ("No data was found")
 * We still probe `currents` on every refresh so the UI can state the truth from NOAA itself.
 *
 * Rules: never fabricate values; keep NOAA's timestamp, units, flags and raw record;
 * fall back to the last good record only when labelled `cached` with its original times.
 */

export const STATION_ID = "8723214";
const BASE = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
const APPLICATION = "NODAL_HackForHumanityMiami_2026";
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 60_000; // courtesy: do not hit NOAA more than once a minute per product set
const MIN_FORCE_INTERVAL_MS = 10_000;
export { STALE_AFTER_MIN };
const DISK_CACHE = path.join(process.env.NODAL_CACHE_DIR ?? path.join(process.cwd(), ".cache"), `noaa-${STATION_ID}.json`);

interface ProductSpec {
  id: ProductId;
  label: string;
  caveat?: string;
  extra?: string;
  parse: (rec: Record<string, unknown>) => ObservedValue[] | null;
}

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

const SPECS: ProductSpec[] = [
  {
    id: "water_temperature",
    label: "Water temperature",
    caveat: "Station-sensor reading at Virginia Key. Not a measurement at any NODAL site.",
    parse: (r) => {
      const v = num(r.v);
      return v === null ? null : [{ key: "v", label: "Water temperature", value: v, unit: "°C" }];
    },
  },
  {
    id: "water_level",
    label: "Water level (tide height)",
    caveat: "Height above MLLW datum. Water level is NOT current speed or direction.",
    extra: "&datum=MLLW",
    parse: (r) => {
      const v = num(r.v);
      return v === null ? null : [{ key: "v", label: "Water level above MLLW", value: v, unit: "m" }];
    },
  },
  {
    id: "wind",
    label: "Wind",
    caveat: "Station anemometer at Virginia Key; direction is where the wind blows FROM.",
    parse: (r) => {
      const s = num(r.s);
      if (s === null) return null;
      const out: ObservedValue[] = [{ key: "s", label: "Wind speed", value: s, unit: "m/s" }];
      const g = num(r.g);
      if (g !== null) out.push({ key: "g", label: "Gust", value: g, unit: "m/s" });
      const d = num(r.d);
      if (d !== null) out.push({ key: "d", label: "Direction", value: `${d}° ${typeof r.dr === "string" ? r.dr : ""}`.trim(), unit: "from" });
      return out;
    },
  },
  {
    id: "air_temperature",
    label: "Air temperature",
    parse: (r) => {
      const v = num(r.v);
      return v === null ? null : [{ key: "v", label: "Air temperature", value: v, unit: "°C" }];
    },
  },
  {
    id: "air_pressure",
    label: "Air pressure",
    caveat: "NOAA reports millibars (1 mb = 1 hPa).",
    parse: (r) => {
      const v = num(r.v);
      return v === null ? null : [{ key: "v", label: "Air pressure", value: v, unit: "mb" }];
    },
  },
  {
    id: "currents",
    label: "Current speed / direction",
    caveat: "Requested on every refresh to show whether NOAA returns any current data.",
    parse: () => null,
  },
];

const requestUrl = (spec: ProductSpec) =>
  `${BASE}?station=${STATION_ID}&product=${spec.id}&date=latest&units=metric&time_zone=gmt&format=json&application=${APPLICATION}${spec.extra ?? ""}`;

interface CacheEntry {
  observedAtUtc: string;
  retrievedAtUtc: string;
  values: ObservedValue[];
  flags?: string;
  quality?: string;
  raw: Record<string, unknown>;
  metadata?: Record<string, string>;
}
type CacheFile = Partial<Record<ProductId, CacheEntry>>;

let mem: CacheFile = {};
let memLoaded = false;
let lastBuilt: { at: number; payload: NoaaResponse } | null = null;
let lastForce = 0;
let inflight: Promise<NoaaResponse> | null = null;
let stationMeta: NoaaResponse["station"] = { id: STATION_ID, name: "Virginia Key", lat: "25.7314", lon: "-80.1618" };

async function loadDisk() {
  if (memLoaded) return;
  memLoaded = true;
  try {
    const t = await fs.readFile(DISK_CACHE, "utf8");
    mem = JSON.parse(t) as CacheFile;
  } catch {
    /* no disk cache — fine */
  }
}
async function saveDisk() {
  try {
    await fs.mkdir(path.dirname(DISK_CACHE), { recursive: true });
    await fs.writeFile(DISK_CACHE, JSON.stringify(mem));
  } catch {
    /* read-only filesystem — memory cache only */
  }
}

/** NOAA `t` is "YYYY-MM-DD HH:mm" in the requested time zone (GMT). */
function gmtToIso(t: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(t.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00Z` : null;
}

type Fetched =
  | { ok: true; entry: CacheEntry }
  | { ok: false; reason: FailureReason; message: string };

async function fetchProduct(spec: ProductSpec): Promise<Fetched> {
  const url = requestUrl(spec);
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), headers: { "User-Agent": APPLICATION } });
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === "TimeoutError" || name === "AbortError") return { ok: false, reason: "timeout", message: `NOAA did not respond within ${REQUEST_TIMEOUT_MS / 1000}s.` };
    return { ok: false, reason: "network_error", message: "Could not reach api.tidesandcurrents.noaa.gov (network outage or DNS)." };
  }
  if (res.status === 429) return { ok: false, reason: "rate_limited", message: "NOAA returned HTTP 429 (rate limited). Retry later." };

  // NOAA reports "product not offered at this station" as HTTP 400 with a JSON error body — parse before judging status.
  let body: { error?: { message?: string }; metadata?: Record<string, string>; data?: Record<string, unknown>[] };
  try {
    body = await res.json();
  } catch {
    return res.ok
      ? { ok: false, reason: "bad_response", message: "NOAA response was not valid JSON." }
      : { ok: false, reason: "http_error", message: `NOAA returned HTTP ${res.status}.` };
  }
  if (!res.ok && !body.error) return { ok: false, reason: "http_error", message: `NOAA returned HTTP ${res.status}.` };
  if (body.error) {
    const msg = (body.error.message ?? "NOAA returned an error").trim();
    // Both messages below are NOAA's way of saying "this station does not offer that product".
    const notOffered = /wrong station id|no data was found|may not be offered/i.test(msg);
    return { ok: false, reason: notOffered ? "not_offered" : "bad_response", message: notOffered ? `NOAA replied “${msg}” to this request for station ${STATION_ID}; no data was returned.` : `NOAA: ${msg}` };
  }
  const rec = body.data?.[body.data.length - 1];
  if (!rec || typeof rec.t !== "string") return { ok: false, reason: "bad_response", message: "NOAA response contained no observation record." };
  const iso = gmtToIso(rec.t);
  const values = spec.parse(rec);
  if (!iso || !values) return { ok: false, reason: "bad_response", message: "NOAA record had missing or unparseable fields." };
  if (body.metadata?.name) stationMeta = { id: body.metadata.id ?? STATION_ID, name: body.metadata.name, lat: body.metadata.lat ?? stationMeta.lat, lon: body.metadata.lon ?? stationMeta.lon };
  return {
    ok: true,
    entry: {
      observedAtUtc: iso,
      retrievedAtUtc: new Date().toISOString(),
      values,
      flags: typeof rec.f === "string" ? rec.f : undefined,
      quality: typeof rec.q === "string" ? rec.q : undefined,
      raw: rec,
    },
  };
}

function toResult(spec: ProductSpec, now: number, f: Fetched | null): NoaaProductResult {
  const base = { product: spec.id, label: spec.label, caveat: spec.caveat, sourceUrl: requestUrl(spec) };
  const cached = mem[spec.id];
  const shape = (e: CacheEntry): NonNullable<NoaaProductResult["observation"]> => {
    const age = Math.max(0, Math.round((now - Date.parse(e.observedAtUtc)) / 60000));
    return { observedAtUtc: e.observedAtUtc, ageMinutes: age, stale: age > STALE_AFTER_MIN, values: e.values, flags: e.flags, quality: e.quality, raw: e.raw };
  };
  if (f && f.ok) return { ...base, state: "fetched", observation: shape(f.entry), retrievedAtUtc: f.entry.retrievedAtUtc };
  const failure = f && !f.ok ? f : { reason: "network_error" as FailureReason, message: "No live retrieval attempted." };
  // A product NOAA says is not offered must never be papered over with old data.
  if (cached && failure.reason !== "not_offered") {
    return { ...base, state: "cached", reason: failure.reason, message: failure.message, observation: shape(cached), retrievedAtUtc: cached.retrievedAtUtc };
  }
  return { ...base, state: "unavailable", reason: failure.reason, message: failure.message };
}

async function build(): Promise<NoaaResponse> {
  await loadDisk();
  const fetched = await Promise.all(SPECS.map((s) => fetchProduct(s)));
  const now = Date.now();
  const products = SPECS.map((spec, i) => {
    const f = fetched[i];
    if (f.ok) mem[spec.id] = f.entry;
    else if (f.reason === "not_offered") delete mem[spec.id];
    return toResult(spec, now, f);
  });
  await saveDisk();
  const offered = products.filter((p) => p.reason !== "not_offered");
  const live = offered.filter((p) => p.state === "fetched").length;
  const cachedN = offered.filter((p) => p.state === "cached").length;
  const overall: NoaaResponse["overall"] = live === offered.length && live > 0 ? "fetched" : live > 0 ? "partial" : cachedN > 0 ? "cached" : "unavailable";
  return {
    station: stationMeta,
    stationUrl: `https://tidesandcurrents.noaa.gov/stationhome.html?id=${STATION_ID}`,
    apiDocsUrl: "https://api.tidesandcurrents.noaa.gov/api/prod/",
    overall,
    responseAtUtc: new Date(now).toISOString(),
    products,
  };
}

/** Cached for 60 s; `force` is honoured at most once per 10 s. Concurrent callers share one upstream request set. */
export async function getNoaa(force = false): Promise<NoaaResponse> {
  const now = Date.now();
  if (lastBuilt && now - lastBuilt.at < CACHE_TTL_MS && !(force && now - lastForce > MIN_FORCE_INTERVAL_MS)) return lastBuilt.payload;
  if (inflight) return inflight;
  if (force) lastForce = now;
  inflight = build()
    .then((payload) => {
      lastBuilt = { at: Date.now(), payload };
      return payload;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

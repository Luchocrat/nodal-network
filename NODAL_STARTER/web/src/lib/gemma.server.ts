import "server-only";
import { getNoaa } from "./noaa.server";
import { runAssessment, type Assessment } from "./scenario";
import type { ExplainRequest, ExplainResult } from "./gemma-types";

/**
 * Gemma 4 explanation layer via the Gemini API (server-only; key from env).
 *
 * Model IDs: Google's Gemma-on-Gemini-API page (ai.google.dev/gemma/docs/core/gemma_on_gemini_api,
 * read 2026-10-10) lists exactly `gemma-4-31b-it` and `gemma-4-26b-a4b-it`. Default: gemma-4-26b-a4b-it.
 * Whether YOUR key can call it is verified at runtime (GET models/<id>) — never assumed.
 *
 * Gemma never calculates and never certifies. It receives the deterministic assessment JSON.
 */
const API = "https://generativelanguage.googleapis.com/v1beta";
export const DEFAULT_MODEL = "gemma-4-26b-a4b-it";
const TIMEOUT_MS = 45_000;

export const getModel = () => (process.env.GEMMA_MODEL?.trim() || DEFAULT_MODEL);
const getKey = () => process.env.GEMINI_API_KEY?.trim() || "";

export const SETUP_STEPS = [
  "Create a Gemini API key in Google AI Studio: https://aistudio.google.com/apikey",
  "In web/, copy .env.example to .env.local and set GEMINI_API_KEY=<your key> (never commit .env.local).",
  `Optionally set GEMMA_MODEL (default ${DEFAULT_MODEL}; also listed by Google: gemma-4-31b-it).`,
  "Restart `npm run dev` so the server reads the new environment.",
];

const SYSTEM_INSTRUCTION = `You are the explanation layer of NODAL, an environmental decision-support prototype for a PROPOSED underwater computing network near Miami.
You do NOT calculate and you do NOT certify anything. You receive a JSON assessment produced by deterministic code. Explain it.

Hard rules:
1. Use ONLY facts present in the JSON. Do not invent observations, numbers, species, costs, thresholds, or engineering limits.
2. Keep evidence categories distinct: OBSERVED (NOAA station readings, regional shore-station context only), SIMULATED (user scenario inputs), CONCEPTUAL (architecture), UNKNOWN (missing evidence).
3. Never state or imply a site is safe, suitable, restorative, or ready to deploy. Ecological suitability is UNDETERMINED. An energy surplus is NOT environmental safety.
4. Water level (tide height) is not current speed or direction.
5. Write in plain language for a city planner: short sentences, no jargon, no rule IDs in the text. Say 'simulated' for scenario numbers and 'measured at a NOAA shore station' for observations, with the observation time.
6. If the observation state is cached or unavailable, say so plainly. When quoting a NOAA value, include its observation time (UTC) and datum.

Output plain text (no markdown tables, no bullet nesting) with EXACTLY these four headings, in order, each on its own line:
WHAT THE NUMBERS SAY
WHAT WE DO NOT KNOW (UNCERTAINTY)
RECOMMENDED NEXT ACTION
LIMITS OF THIS EXPLANATION
Maximum 150 words total. Be concrete and calm.`;

/* ---- simple local rate limit (protects the key if the app is ever exposed) ---- */
const hits: number[] = [];
function rateLimited() {
  const now = Date.now();
  while (hits.length && now - hits[0] > 60_000) hits.shift();
  if (hits.length >= 8) return true;
  hits.push(now);
  return false;
}

export async function buildPayload(req: ExplainRequest): Promise<{ assessment: Assessment; payload: unknown }> {
  const noaa = await getNoaa(false);
  const assessment = runAssessment({
    demandKw: req.demandKw,
    generationKw: req.generationKw,
    batteryKwh: req.batteryKwh,
    nodeId: req.nodeId,
    noaaStatus: noaa.overall,
  });
  const observedContext = {
    tag: "OBSERVED",
    source: "NOAA CO-OPS Tides & Currents",
    station: noaa.station,
    retrievalState: noaa.overall,
    note: "Shore-station context; not a NODAL site measurement. Water level is not current speed.",
    products: noaa.products.map((p) => ({
      product: p.product,
      state: p.state,
      failure: p.reason ? { reason: p.reason, message: p.message } : undefined,
      observedAtUtc: p.observation?.observedAtUtc,
      ageMinutes: p.observation?.ageMinutes,
      values: p.observation?.values,
      qualityFlag: p.observation?.quality,
    })),
  };
  return { assessment, payload: { assessment, observedContext } };
}

async function listGemma(key: string): Promise<string[]> {
  try {
    const r = await fetch(`${API}/models?pageSize=200`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (!r.ok) return [];
    const j = (await r.json()) as { models?: { name: string }[] };
    return (j.models ?? []).map((m) => m.name.replace(/^models\//, "")).filter((n) => /gemma/i.test(n));
  } catch {
    return [];
  }
}

/** Cheap availability check for the UI (no generation). Cached 5 min. */
let statusCache: { at: number; value: { configured: boolean; model: string; modelAvailable: boolean | null; detail?: string } } | null = null;
export async function gemmaStatus() {
  const model = getModel();
  const key = getKey();
  if (!key) return { configured: false, model, modelAvailable: null as boolean | null, detail: "GEMINI_API_KEY is not set." };
  if (statusCache && Date.now() - statusCache.at < 300_000 && statusCache.value.model === model) return statusCache.value;
  let value: { configured: boolean; model: string; modelAvailable: boolean | null; detail?: string };
  try {
    const r = await fetch(`${API}/models/${encodeURIComponent(model)}`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(10_000), cache: "no-store" });
    value = r.ok
      ? { configured: true, model, modelAvailable: true }
      : r.status === 404
        ? { configured: true, model, modelAvailable: false, detail: `Model ${model} not found for this key.` }
        : { configured: true, model, modelAvailable: null, detail: `Model check returned HTTP ${r.status}.` };
  } catch {
    value = { configured: true, model, modelAvailable: null, detail: "Could not reach the Gemini API to verify the model." };
  }
  statusCache = { at: Date.now(), value };
  return value;
}

export async function explain(req: ExplainRequest): Promise<ExplainResult> {
  const model = getModel();
  const key = getKey();

  const { assessment, payload } = await buildPayload(req);
  if (!assessment.valid) return { state: "failed", reason: "invalid_input", message: assessment.errors.join("; "), model };

  if (!key) {
    return {
      state: "unavailable",
      reason: "no_api_key",
      model,
      payload,
      message: "No GEMINI_API_KEY is configured on the server, so Gemma 4 was not called. No explanation is shown because none was generated.",
      setup: SETUP_STEPS,
    };
  }
  if (rateLimited()) return { state: "failed", reason: "rate_limited_local", model, payload, message: "Local limit: 8 explanation requests per minute. Wait a moment and retry." };

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(`${API}/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: `Assessment JSON (authoritative; do not recompute):\n${JSON.stringify(payload, null, 2)}` }] }],
        // thinkingLevel "minimal" disables Gemma 4 reasoning tokens, which otherwise exhaust the output budget (verified: MAX_TOKENS with no text).
        generationConfig: { temperature: 0.2, maxOutputTokens: 2000, thinkingConfig: { thinkingLevel: "minimal" } },
      }),
    });
  } catch (e) {
    const name = (e as { name?: string })?.name;
    return name === "TimeoutError" || name === "AbortError"
      ? { state: "failed", reason: "timeout", model, payload, message: `Gemini API did not answer within ${TIMEOUT_MS / 1000}s.` }
      : { state: "failed", reason: "network_error", model, payload, message: "Could not reach generativelanguage.googleapis.com." };
  }

  if (!res.ok) {
    let apiMsg = "";
    try {
      apiMsg = ((await res.json()) as { error?: { message?: string } }).error?.message ?? "";
    } catch {
      /* ignore */
    }
    const base = { state: "failed" as const, model, payload, httpStatus: res.status };
    if (res.status === 404) return { ...base, reason: "model_not_found", message: `Model "${model}" was not found for this key. ${apiMsg}`.trim(), availableGemmaModels: await listGemma(key) };
    if (res.status === 429) return { ...base, reason: "quota", message: `Quota or rate limit reached on the Gemini API. ${apiMsg}`.trim() };
    if (res.status === 401 || (res.status === 400 && /api key/i.test(apiMsg))) return { ...base, reason: "invalid_key", message: `The Gemini API rejected the key. ${apiMsg}`.trim() };
    if (res.status === 403) return { ...base, reason: "permission_denied", message: `Permission denied for this key/model. ${apiMsg}`.trim() };
    return { ...base, reason: "upstream_error", message: `Gemini API error HTTP ${res.status}. ${apiMsg}`.trim() };
  }

  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[] };
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter((p) => !p.thought && typeof p.text === "string").map((p) => p.text).join("").trim();
  if (!text) return { state: "failed", reason: "empty_response", model, payload, message: `Gemini API returned no text (finishReason: ${json.candidates?.[0]?.finishReason ?? "unknown"}).` };

  return {
    state: "success",
    model,
    payload,
    text,
    latencyMs: Date.now() - started,
    checks: { hasUncertaintySection: /uncertainty/i.test(text), citesRuleIds: /\[NODAL-[A-Z]+-\d+\]/.test(text) },
  };
}

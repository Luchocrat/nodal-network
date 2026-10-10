import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const rec = (extra: Record<string, string> = {}) => ({ metadata: { id: "8723214", name: "Virginia Key", lat: "25.7314", lon: "-80.1618" }, data: [{ t: "2026-10-10 16:18", v: "30.1", f: "0,0,0", ...extra }] });
const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

async function freshAdapter() {
  process.env.NODAL_CACHE_DIR = mkdtempSync(path.join(tmpdir(), "nodal-noaa-"));
  vi.resetModules();
  return import("@/lib/noaa.server");
}

function routeFetch(handler: (product: string) => Response | Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => handler(new URL(url).searchParams.get("product") ?? "")));
}

beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("NOAA adapter", () => {
  it("parses live products, converts GMT to ISO UTC, preserves raw record", async () => {
    vi.setSystemTime(new Date("2026-10-10T16:30:00Z"));
    const { getNoaa } = await freshAdapter();
    routeFetch((p) =>
      p === "currents" ? ok({ error: { message: "Wrong Station ID: Please submit a valid station ID" } }, 400)
      : p === "wind" ? ok(rec({ v: undefined as unknown as string, s: "6.4", d: "161.0", dr: "SSE", g: "7.7" }))
      : ok(rec()),
    );
    const r = await getNoaa(true);
    expect(r.overall).toBe("fetched");
    const wt = r.products.find((p) => p.product === "water_temperature")!;
    expect(wt.state).toBe("fetched");
    expect(wt.observation?.observedAtUtc).toBe("2026-10-10T16:18:00Z");
    expect(wt.observation?.values[0]).toMatchObject({ value: 30.1, unit: "°C" });
    expect(wt.observation?.raw.t).toBe("2026-10-10 16:18");
    expect(wt.observation?.ageMinutes).toBe(12);
    expect(wt.sourceUrl).toContain("station=8723214");
    expect(r.products.find((p) => p.product === "wind")?.observation?.values.map((v) => v.unit)).toEqual(["m/s", "m/s", "from"]);
  });

  it("reports unoffered products honestly (HTTP 400 + JSON error) and never fills them in", async () => {
    const { getNoaa } = await freshAdapter();
    routeFetch((p) => (p === "currents" ? ok({ error: { message: "Wrong Station ID: Please submit a valid station ID" } }, 400) : ok(rec())));
    const c = (await getNoaa(true)).products.find((p) => p.product === "currents")!;
    expect(c.state).toBe("unavailable");
    expect(c.reason).toBe("not_offered");
    expect(c.observation).toBeUndefined();
  });

  it("falls back to labelled CACHED data on rate limit, keeping the original times", async () => {
    vi.setSystemTime(new Date("2026-10-10T16:30:00Z"));
    const { getNoaa } = await freshAdapter();
    routeFetch((p) => (p === "currents" ? ok({ error: { message: "No data was found." } }, 400) : ok(rec())));
    await getNoaa(true);
    vi.setSystemTime(new Date("2026-10-10T17:45:00Z")); // > TTL and > force interval
    routeFetch(() => new Response("slow down", { status: 429 }));
    const r = await getNoaa(true);
    expect(r.overall).toBe("cached");
    const wt = r.products.find((p) => p.product === "water_temperature")!;
    expect(wt.state).toBe("cached");
    expect(wt.reason).toBe("rate_limited");
    expect(wt.observation?.observedAtUtc).toBe("2026-10-10T16:18:00Z");
    expect(wt.retrievedAtUtc).toBe("2026-10-10T16:30:00.000Z");
    expect(wt.observation?.stale).toBe(true);
  });

  it("is UNAVAILABLE (not invented) on network outage with an empty cache", async () => {
    const { getNoaa } = await freshAdapter();
    routeFetch(() => { throw new TypeError("fetch failed"); });
    const r = await getNoaa(true);
    expect(r.overall).toBe("unavailable");
    expect(r.products.every((p) => p.state === "unavailable" && p.reason === "network_error" && !p.observation)).toBe(true);
  });

  it("flags malformed payloads as bad_response", async () => {
    const { getNoaa } = await freshAdapter();
    routeFetch(() => ok({ metadata: {}, data: [{ t: "garbage", v: "x" }] }));
    const r = await getNoaa(true);
    expect(r.products[0].reason).toBe("bad_response");
  });
});

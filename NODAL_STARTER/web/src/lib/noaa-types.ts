/** Client-safe NOAA response types (no server imports). */
export type ProductId = "water_temperature" | "water_level" | "wind" | "air_temperature" | "air_pressure" | "currents";

/** App freshness notice only (NOAA met/water data are ~6-minute); not a science threshold. */
export const STALE_AFTER_MIN = 60;

export type RetrievalState = "fetched" | "cached" | "unavailable";
export type FailureReason = "not_offered" | "rate_limited" | "network_error" | "timeout" | "bad_response" | "http_error";

export interface ObservedValue {
  key: string;
  label: string;
  value: number | string;
  unit: string;
}

export interface NoaaProductResult {
  product: ProductId;
  label: string;
  /** Plain-language caveat shown with the value. */
  caveat?: string;
  state: RetrievalState;
  /** Why the live request failed (set for `cached` and `unavailable`). */
  reason?: FailureReason;
  message?: string;
  observation?: {
    /** Observation time, ISO-8601 UTC, converted from NOAA's GMT `t`. */
    observedAtUtc: string;
    /** Minutes between observation time and this response (computed server-side). */
    ageMinutes: number;
    /** True when older than STALE_AFTER_MIN — an app freshness notice, not a science threshold. */
    stale: boolean;
    values: ObservedValue[];
    flags?: string;
    quality?: string;
    /** Untouched first record from NOAA's `data` array. */
    raw: Record<string, unknown>;
  };
  /** When this app last received this product from NOAA (ISO UTC). For `cached`, the ORIGINAL retrieval time. */
  retrievedAtUtc?: string;
  /** Exact NOAA API request URL (human-verifiable source). */
  sourceUrl: string;
}

export interface NoaaResponse {
  station: { id: string; name: string; lat: string; lon: string };
  stationUrl: string;
  apiDocsUrl: string;
  /** Aggregate: fetched = all live; partial = some live, some not; cached = nothing live but cached; unavailable = nothing. */
  overall: "fetched" | "partial" | "cached" | "unavailable";
  responseAtUtc: string;
  products: NoaaProductResult[];
}

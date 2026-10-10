export interface ExplainRequest {
  demandKw: number;
  generationKw: number;
  batteryKwh: number | null;
  nodeId: string;
}

export interface ExplainChecks {
  hasUncertaintySection: boolean;
  citesRuleIds: boolean;
}

interface Common {
  model: string;
  /** Exact structured JSON sent to Gemma (assessment + NOAA context). Shown in the UI for audit. */
  payload?: unknown;
}

export type ExplainResult =
  | (Common & { state: "success"; text: string; latencyMs: number; checks: ExplainChecks })
  | (Common & { state: "unavailable"; reason: "no_api_key"; message: string; setup: string[] })
  | (Common & {
      state: "failed";
      reason: "invalid_input" | "invalid_key" | "permission_denied" | "model_not_found" | "quota" | "rate_limited_local" | "timeout" | "network_error" | "upstream_error" | "empty_response";
      message: string;
      httpStatus?: number;
      availableGemmaModels?: string[];
    });

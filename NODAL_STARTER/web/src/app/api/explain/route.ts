import { NextResponse } from "next/server";
import { explain, gemmaStatus } from "@/lib/gemma.server";
import type { ExplainRequest } from "@/lib/gemma-types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET: is Gemma configured / is the model reachable for this key? (no generation, no key leakage) */
export async function GET() {
  return NextResponse.json(await gemmaStatus(), { headers: { "Cache-Control": "no-store" } });
}

/** POST: server recomputes the assessment from raw scenario inputs, attaches NOAA context, calls Gemma. */
export async function POST(req: Request) {
  let body: Partial<ExplainRequest>;
  try {
    body = (await req.json()) as Partial<ExplainRequest>;
  } catch {
    return NextResponse.json({ state: "failed", reason: "invalid_input", message: "Request body must be JSON.", model: "" }, { status: 400 });
  }
  const input: ExplainRequest = {
    demandKw: Number(body.demandKw),
    generationKw: Number(body.generationKw),
    batteryKwh: body.batteryKwh === null || body.batteryKwh === undefined ? null : Number(body.batteryKwh),
    nodeId: String(body.nodeId ?? ""),
  };
  const result = await explain(input);
  const status = result.state === "success" ? 200 : result.state === "unavailable" ? 503 : result.state === "failed" && result.reason === "invalid_input" ? 400 : result.state === "failed" && (result.reason === "quota" || result.reason === "rate_limited_local") ? 429 : 502;
  return NextResponse.json(result, { status, headers: { "Cache-Control": "no-store" } });
}

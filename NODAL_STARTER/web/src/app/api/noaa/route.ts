import { NextResponse } from "next/server";
import { getNoaa } from "@/lib/noaa.server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("refresh") === "1";
  const data = await getNoaa(force);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

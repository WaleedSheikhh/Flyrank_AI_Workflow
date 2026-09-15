import { NextRequest, NextResponse } from "next/server";
import { runStore } from "@/lib/runStore";

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) return NextResponse.json({ error: "missing runId" }, { status: 400 });
  const result = runStore.get(runId) ?? {
    status: "pending",
    currentNodeId: null,
    executionOrder: [],
  };
  return NextResponse.json(result);
}
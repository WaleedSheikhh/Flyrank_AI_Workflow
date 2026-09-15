import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { runStore } from "@/lib/runStore";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { nodes, edges, input, startNodeId } = await req.json();
  const runId = randomUUID();

  runStore.set(runId, {
    status: "pending",
    currentNodeId: null,
    executionOrder: [],
  });

  await inngest.send({
    name: "workflow/run",
    data: { runId, nodes, edges, input, startNodeId },
  });

  return NextResponse.json({ runId });
}
import { inngest } from "../client";
import { groq } from "@/lib/groq";
import { runStore } from "@/lib/runStore";

export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", triggers: { event: "workflow/run" } },
  async ({ event, step }) => {
    const { runId, nodes, edges, input, startNodeId } = event.data;
    const executionOrder: {
      nodeId: string;
      label: string;
      decision: string;
      status: "done" | "error";
      error?: string;
    }[] = [];

    let currentNodeId: string | null = startNodeId;

    while (currentNodeId) {
      const node = nodes.find((n: any) => n.id === currentNodeId);
      if (!node) break;

      runStore.set(runId, {
        status: "pending",
        currentNodeId: node.id,
        executionOrder: [...executionOrder],
      });

      let decision: string;
      let stepError: string | undefined;

      try {
        decision = await step.run(`evaluate-node-${node.id}`, async () => {
          const completion = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL!,
            temperature: 0,
            messages: [
              {
                role: "system",
                content:
                  "You are a strict classifier. Answer with only the single word YES or NO, nothing else.",
              },
              { role: "user", content: `Question: ${node.data.label}\n\nInput: ${input}` },
            ],
          });
          const raw = completion.choices[0].message.content?.trim().toUpperCase() ?? "";
          if (!raw.includes("YES") && !raw.includes("NO")) {
            throw new Error(`Model returned an unrecognized answer: "${raw}"`);
          }
          return raw.includes("YES") ? "YES" : "NO";
        });
      } catch (err: any) {
        stepError = err?.message ?? "Unknown error evaluating this node";
        executionOrder.push({
          nodeId: node.id,
          label: node.data.label,
          decision: "ERROR",
          status: "error",
          error: stepError,
        });
        runStore.set(runId, {
          status: "error",
          currentNodeId: null,
          executionOrder: [...executionOrder],
        });
        return { executionOrder, error: stepError };
      }

      executionOrder.push({
        nodeId: node.id,
        label: node.data.label,
        decision,
        status: "done",
      });

      const nextEdge = edges.find(
        (e: any) => e.source === node.id && e.sourceHandle === decision.toLowerCase()
      );
      currentNodeId = nextEdge ? nextEdge.target : null;
    }

    runStore.set(runId, {
      status: "done",
      currentNodeId: null,
      executionOrder,
    });
    return { executionOrder };
  }
);
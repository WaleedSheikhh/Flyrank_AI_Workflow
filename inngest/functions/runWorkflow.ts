import { inngest } from "../client";
import { groq } from "@/lib/groq";
import { runStore } from "@/lib/runStore";

type WorkflowNode = {
  id: string;
  data: { label: string };
};

type WorkflowEdge = {
  source: string;
  target: string;
  sourceHandle?: string | null;
};

export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", triggers: { event: "workflow/run" } },
  async ({ event, step }) => {
    const { runId, nodes, edges, input, startNodeId } = event.data as {
      runId: string;
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      input: string;
      startNodeId: string;
    };
    const executionOrder: { nodeId: string; label: string; decision: string }[] = [];

    let currentNodeId: string | null = startNodeId;

    while (currentNodeId) {
      const node = nodes.find((n) => n.id === currentNodeId);
      if (!node) break;

      const decision = await step.run(`evaluate-node-${node.id}`, async () => {
        const completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL!,
          temperature: 0,
          messages: [
            {
              role: "system",
              content: "You are a strict classifier. Answer with only the single word YES or NO, nothing else.",
            },
            { role: "user", content: `Question: ${node.data.label}\n\nInput: ${input}` },
          ],
        });
        const raw = completion.choices[0].message.content?.trim().toUpperCase() ?? "";
        return raw.includes("YES") ? "YES" : "NO";
      });

      executionOrder.push({ nodeId: node.id, label: node.data.label, decision });

      const nextEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === decision.toLowerCase()
      );
      currentNodeId = nextEdge ? nextEdge.target : null;
    }

    runStore.set(runId, { status: "done", executionOrder });
    return { executionOrder };
  }
);

type RunResult = {
    status: "pending" | "done";
    executionOrder: { nodeId: string; label: string; decision: string }[];
  };
  
  const store = new Map<string, RunResult>();
  export const runStore = store;
type RunStep = {
    nodeId: string;
    label: string;
    decision: string;
    status: "done" | "error";
    error?: string;
  };
  
  type RunResult = {
    status: "pending" | "done" | "error";
    currentNodeId: string | null;
    executionOrder: RunStep[];
  };
  
  const store = new Map<string, RunResult>();
  export const runStore = store;
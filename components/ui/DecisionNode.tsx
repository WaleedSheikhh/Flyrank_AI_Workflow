"use client";

import { Handle, Position } from "@xyflow/react";

export default function DecisionNode({ data, id }: { data: { label: string; onChange: (id: string, value: string) => void }; id: string }) {
  return (
    <div style={{ padding: "10px 15px", border: "1px solid #222", borderRadius: "6px", background: "white", minWidth: "180px" }}>
      <Handle type="target" position={Position.Top} />
      <input
        value={data.label}
        onChange={(e) => data.onChange(id, e.target.value)}
        style={{ border: "none", outline: "none", width: "100%", textAlign: "center", fontFamily: "inherit" }}
        placeholder="Type your question..."
      />
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: "30%", background: "#22c55e" }} />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: "70%", background: "#ef4444" }} />
    </div>
  );
}
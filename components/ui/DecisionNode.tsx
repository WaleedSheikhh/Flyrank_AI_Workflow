"use client";

import { Handle, Position } from "@xyflow/react";

export default function DecisionNode({
  data,
  id,
}: {
  data: {
    label: string;
    onChange: (id: string, value: string) => void;
    isActive?: boolean;
    lastResult?: "YES" | "NO" | "ERROR" | null;
  };
  id: string;
}) {
  const isActive = data.isActive;
  const lastResult = data.lastResult;

  const borderColor =
    lastResult === "ERROR" ? "#ef4444" : isActive ? "#0074FF" : "#222";

  return (
    <div
      style={{
        padding: "10px 15px",
        border: `2px solid ${borderColor}`,
        borderRadius: "6px",
        background: "white",
        minWidth: "180px",
        boxShadow: isActive ? "0 0 0 4px rgba(0, 116, 255, 0.2)" : "none",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <input
        value={data.label}
        onChange={(e) => data.onChange(id, e.target.value)}
        style={{
          border: "none",
          outline: "none",
          width: "100%",
          textAlign: "center",
          fontFamily: "inherit",
        }}
        placeholder="Type your question..."
      />
      {lastResult && lastResult !== "ERROR" && (
        <div
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            marginTop: "4px",
            color: lastResult === "YES" ? "#22c55e" : "#ef4444",
            fontWeight: 600,
          }}
        >
          {lastResult}
        </div>
      )}
      {lastResult === "ERROR" && (
        <div style={{ textAlign: "center", fontSize: "0.75rem", marginTop: "4px", color: "#ef4444", fontWeight: 600 }}>
          ERROR
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: "30%", background: "#22c55e" }} />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: "70%", background: "#ef4444" }} />
    </div>
  );
}
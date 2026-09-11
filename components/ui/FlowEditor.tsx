"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DecisionNode from "./DecisionNode";

const nodeTypes = { decision: DecisionNode };

export default function FlowEditor() {
  const [nodeIdCounter, setNodeIdCounter] = useState(2);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<
    { nodeId: string; label: string; decision: string }[]
  >([]);

  const updateNodeLabel = useCallback((id: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: value } } : node
      )
    );
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: "1",
      type: "decision",
      position: { x: 250, y: 50 },
      data: { label: "Is this a support request?", onChange: updateNodeLabel },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const isYes = connection.sourceHandle === "yes";
      const newEdge = {
        ...connection,
        label: isYes ? "YES" : "NO",
        style: { stroke: isYes ? "#22c55e" : "#ef4444" },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addNode = () => {
    const newNode: Node = {
      id: String(nodeIdCounter),
      type: "decision",
      position: { x: 250, y: 50 + nodeIdCounter * 150 },
      data: { label: "New decision node", onChange: updateNodeLabel },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((id) => id + 1);
  };

  const runWorkflow = async () => {
    setRunning(true);
    setResults([]);

    const startNode = nodes[0];
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes, edges, input, startNodeId: startNode.id }),
    });
    const { runId } = await res.json();

    const poll = setInterval(async () => {
      const statusRes = await fetch(`/api/run-status?runId=${runId}`);
      const status = await statusRes.json();
      setResults(status.executionOrder);

      if (status.status === "done") {
        clearInterval(poll);
        setRunning(false);
      }
    }, 1000);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button
        onClick={addNode}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          padding: "0.5rem 1rem",
          background: "#0074FF",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        + Add Node
      </button>

      <div
        style={{
          position: "absolute",
          top: 10,
          left: 140,
          zIndex: 10,
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Test input, e.g. 'my payment failed'"
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            width: "260px",
          }}
        />
        <button
          onClick={runWorkflow}
          disabled={running}
          style={{
            padding: "0.5rem 1rem",
            background: running ? "#999" : "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: running ? "default" : "pointer",
          }}
        >
          {running ? "Running..." : "▶ Run"}
        </button>
      </div>

      {results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 140,
            zIndex: 10,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "0.75rem",
            maxWidth: "320px",
            fontSize: "0.9rem",
          }}
        >
          {results.map((r, i) => (
            <div key={i}>
              {i + 1}. {r.label} → <strong>{r.decision}</strong>
            </div>
          ))}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
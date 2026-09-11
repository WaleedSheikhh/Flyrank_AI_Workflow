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

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 250, y: 50 },
    data: { label: "Is this a support request?" },
  },
];

const initialEdges: Edge[] = [];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(2);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const addNode = () => {
    const newNode: Node = {
      id: String(nodeIdCounter),
      position: { x: 250, y: 50 + nodeIdCounter * 120 },
      data: { label: "New decision node" },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((id) => id + 1);
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
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
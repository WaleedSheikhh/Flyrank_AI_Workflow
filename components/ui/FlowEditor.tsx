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
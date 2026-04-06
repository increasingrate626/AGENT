import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '../../stores/workflowStore';
import UserInputNode from '../Nodes/UserInputNode';
import LLMNode from '../Nodes/LLMNode';
import ToolNode from '../Nodes/ToolNode';
import EndNode from '../Nodes/EndNode';
import type { NodeType } from '../../types/workflow';
import { DEFAULT_CONFIGS } from '../../constants/defaultConfigs';
import { NODE_REGISTRY } from '../../constants/nodeRegistry';

const nodeTypes = {
  user_input: UserInputNode,
  llm: LLMNode,
  tts: ToolNode,
  end: EndNode,
};

const FlowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);
  const addNode = useWorkflowStore((s) => s.addNode);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        'application/reactflow-type'
      ) as NodeType;
      if (!type || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [addNode]
  );

  // Apply execution status to edges
  const styledEdges = edges.map((e) => ({
    ...e,
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    type: 'smoothstep',
  }));

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2 },
        }}
      >
        <Background gap={15} size={1} color="#f0f0f0" />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          style={{ height: 100 }}
        />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;

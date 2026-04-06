import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import type { NodeType } from '../types/workflow';
import { DEFAULT_CONFIGS } from '../constants/defaultConfigs';
import { NODE_REGISTRY } from '../constants/nodeRegistry';

let idCounter = 0;
export function generateId(prefix = 'node'): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

interface WorkflowMeta {
  id: string;
  name: string;
  description: string;
}

interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  workflowMeta: WorkflowMeta;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  setSelectedNode: (nodeId: string | null) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  setWorkflow: (
    meta: WorkflowMeta,
    nodes: Node[],
    edges: Edge[]
  ) => void;
  setWorkflowMeta: (meta: Partial<WorkflowMeta>) => void;
  getSerializableState: () => {
    nodes: Array<{
      id: string;
      type: string;
      label: string;
      position: { x: number; y: number };
      config: Record<string, unknown>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle: string;
      targetHandle: string;
    }>;
  };
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowMeta: { id: '', name: 'Untitled Workflow', description: '' },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: false }, get().edges) });
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  addNode: (type, position) => {
    const registry = NODE_REGISTRY.find((n) => n.type === type);
    const nodeId = generateId('node');
    const newNode: Node = {
      id: nodeId,
      type: type,
      position,
      data: {
        label: registry?.label || type,
        config: { ...DEFAULT_CONFIGS[type] },
        nodeType: type,
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeConfig: (nodeId, config) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
          : n
      ),
    });
  },

  removeNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  setWorkflow: (meta, nodes, edges) => {
    set({ workflowMeta: meta, nodes, edges, selectedNodeId: null });
  },

  setWorkflowMeta: (meta) => {
    set({ workflowMeta: { ...get().workflowMeta, ...meta } });
  },

  getSerializableState: () => {
    const { nodes, edges } = get();
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type || 'user_input',
        label: n.data?.label || '',
        position: n.position,
        config: n.data?.config || {},
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || 'output',
        targetHandle: e.targetHandle || 'input',
      })),
    };
  },
}));

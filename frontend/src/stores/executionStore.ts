import { create } from 'zustand';
import type {
  ExecutionStatusEvent,
  LogEntry,
  NodeExecutionStatus,
} from '../types/execution';

interface ExecutionStore {
  isRunning: boolean;
  executionId: string | null;
  nodeStatuses: Record<string, NodeExecutionStatus>;
  logs: LogEntry[];
  audioUrl: string | null;
  audioText: string | null;
  error: string | null;

  startExecution: (executionId: string) => void;
  handleEvent: (event: ExecutionStatusEvent) => void;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  isRunning: false,
  executionId: null,
  nodeStatuses: {},
  logs: [],
  audioUrl: null,
  audioText: null,
  error: null,

  startExecution: (executionId) => {
    set({
      isRunning: true,
      executionId,
      nodeStatuses: {},
      logs: [],
      audioUrl: null,
      audioText: null,
      error: null,
    });
  },

  handleEvent: (event) => {
    const state = get();

    // Append log
    const newLog: LogEntry = {
      timestamp: event.timestamp,
      nodeId: event.node_id,
      nodeType: event.node_type,
      message: event.message,
    };

    const updates: Partial<ExecutionStore> = {
      logs: [...state.logs, newLog],
    };

    switch (event.event_type) {
      case 'node_start':
        if (event.node_id) {
          updates.nodeStatuses = {
            ...state.nodeStatuses,
            [event.node_id]: 'running',
          };
        }
        break;

      case 'node_complete':
        if (event.node_id) {
          updates.nodeStatuses = {
            ...state.nodeStatuses,
            [event.node_id]: 'completed',
          };
        }
        if (event.data?.audio_url) {
          updates.audioUrl = event.data.audio_url;
        }
        if (event.data?.audio_text) {
          updates.audioText = event.data.audio_text;
        }
        break;

      case 'node_error':
        if (event.node_id) {
          updates.nodeStatuses = {
            ...state.nodeStatuses,
            [event.node_id]: 'error',
          };
        }
        updates.error = event.data?.error || event.message;
        break;

      case 'workflow_complete':
        updates.isRunning = false;
        if (event.data?.audio_url) {
          updates.audioUrl = event.data.audio_url;
        }
        if (event.data?.audio_text) {
          updates.audioText = event.data.audio_text;
        }
        if (event.data?.error) {
          updates.error = event.data.error;
        }
        break;
    }

    set(updates as ExecutionStore);
  },

  reset: () => {
    set({
      isRunning: false,
      executionId: null,
      nodeStatuses: {},
      logs: [],
      audioUrl: null,
      audioText: null,
      error: null,
    });
  },
}));

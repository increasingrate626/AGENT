export interface ExecutionRequest {
  workflow_id: string;
  inputs: Record<string, string>;
}

export interface ExecutionStatusEvent {
  execution_id: string;
  event_type: 'node_start' | 'node_complete' | 'node_error' | 'workflow_complete' | 'log';
  node_id: string | null;
  node_type: string | null;
  message: string;
  timestamp: string;
  data: {
    output_text?: string;
    audio_url?: string;
    error?: string;
    duration_ms?: number;
  };
}

export type NodeExecutionStatus = 'pending' | 'running' | 'completed' | 'error';

export interface LogEntry {
  timestamp: string;
  nodeId: string | null;
  nodeType: string | null;
  message: string;
}

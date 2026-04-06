export interface Position {
  x: number;
  y: number;
}

export type NodeType = 'user_input' | 'llm' | 'tts' | 'end';

export interface UserInputConfig {
  variable_name: string;
  placeholder: string;
}

export interface LLMConfig {
  model: string;
  api_base: string;
  api_key: string;
  system_prompt: string;
  prompt_template: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export interface TTSConfig {
  voice: string;
  speed: string;
  pitch: string;
  output_format: string;
}

export interface EndConfig {
  output_type: 'audio' | 'text' | 'auto';
}

export type NodeConfig = UserInputConfig | LLMConfig | TTSConfig | EndConfig;

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  node_count: number;
  updated_at: string;
}

import type { NodeType } from '../types/workflow';

export interface NodeRegistryItem {
  type: NodeType;
  label: string;
  category: 'llm' | 'tool' | 'io';
  description: string;
  icon: string;
  color: string;
}

export const NODE_REGISTRY: NodeRegistryItem[] = [
  {
    type: 'user_input',
    label: '用户输入',
    category: 'io',
    description: '工作流起始节点，接收用户文本输入',
    icon: 'MessageOutlined',
    color: '#52c41a',
  },
  {
    type: 'llm',
    label: '大模型',
    category: 'llm',
    description: '调用大语言模型生成文本',
    icon: 'RobotOutlined',
    color: '#1677ff',
  },
  {
    type: 'tts',
    label: '超拟人音频合成',
    category: 'tool',
    description: '将文本转换为超拟人语音音频',
    icon: 'SoundOutlined',
    color: '#722ed1',
  },
  {
    type: 'end',
    label: '结束',
    category: 'io',
    description: '工作流结束节点，输出最终结果',
    icon: 'CheckCircleOutlined',
    color: '#8c8c8c',
  },
];

export const SIDEBAR_CATEGORIES = [
  {
    key: 'llm',
    label: '大模型节点',
    nodes: NODE_REGISTRY.filter((n) => n.category === 'llm'),
  },
  {
    key: 'tool',
    label: '工具节点',
    nodes: NODE_REGISTRY.filter((n) => n.category === 'tool'),
  },
  {
    key: 'io',
    label: '输入/输出节点',
    nodes: NODE_REGISTRY.filter((n) => n.category === 'io'),
  },
];

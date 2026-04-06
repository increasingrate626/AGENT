import type { NodeType } from '../types/workflow';

export const DEFAULT_CONFIGS: Record<NodeType, Record<string, unknown>> = {
  user_input: {
    variable_name: 'user_input',
    placeholder: '请输入文本...',
  },
  llm: {
    model: 'deepseek-chat',
    api_base: 'https://api.deepseek.com',
    api_key: 'sk-711e7522ffe24bbfa92288e65a02ca4f',
    temperature: 0.7,
    parameters: [
      {
        name: 'user_input',
        type: 'reference',
        value: '',
        referenceNode: '',
      },
    ],
    output_parameters: [
      {
        name: 'text',
        type: 'string',
        description: 'LLM 生成的文本输出',
      },
    ],
  },
  tts: {
    voice: 'zh-CN-XiaoxiaoNeural',
    speed: '+0%',
    pitch: '+0Hz',
    output_format: 'mp3',
  },
  end: {
    output_type: 'auto',
  },
};

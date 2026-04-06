import type { NodeType } from '../types/workflow';

export const DEFAULT_CONFIGS: Record<NodeType, Record<string, unknown>> = {
  user_input: {
    variable_name: 'user_input',
    placeholder: '请输入文本...',
  },
  llm: {
    model: 'gpt-3.5-turbo',
    api_base: '',
    api_key: '',
    system_prompt: '',
    prompt_template: '{{user_input}}',
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1.0,
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

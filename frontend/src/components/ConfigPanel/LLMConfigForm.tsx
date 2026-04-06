import React from 'react';
import { Form, Input, Slider, InputNumber } from 'antd';
import { useWorkflowStore } from '../../stores/workflowStore';

const LLMConfigForm: React.FC<{ nodeId: string; config: Record<string, unknown> }> = ({
  nodeId,
  config,
}) => {
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);

  const onChange = (key: string, value: unknown) => {
    updateNodeConfig(nodeId, { [key]: value });
  };

  return (
    <Form layout="vertical" size="small">
      <Form.Item label="模型">
        <Input
          value={(config.model as string) || ''}
          onChange={(e) => onChange('model', e.target.value)}
          placeholder="gpt-3.5-turbo"
        />
      </Form.Item>
      <Form.Item label="API 地址">
        <Input
          value={(config.api_base as string) || ''}
          onChange={(e) => onChange('api_base', e.target.value)}
          placeholder="https://api.openai.com/v1"
        />
      </Form.Item>
      <Form.Item label="API 密钥">
        <Input.Password
          value={(config.api_key as string) || ''}
          onChange={(e) => onChange('api_key', e.target.value)}
          placeholder="sk-..."
        />
      </Form.Item>
      <Form.Item label="系统提示词">
        <Input.TextArea
          value={(config.system_prompt as string) || ''}
          onChange={(e) => onChange('system_prompt', e.target.value)}
          rows={3}
          placeholder="你是一个有帮助的助手..."
        />
      </Form.Item>
      <Form.Item label="提示词模板">
        <Input.TextArea
          value={(config.prompt_template as string) || ''}
          onChange={(e) => onChange('prompt_template', e.target.value)}
          rows={3}
          placeholder="使用 {{变量名}} 进行插值"
        />
      </Form.Item>
      <Form.Item label={`温度: ${config.temperature ?? 0.7}`}>
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={(config.temperature as number) ?? 0.7}
          onChange={(v) => onChange('temperature', v)}
        />
      </Form.Item>
      <Form.Item label="最大 Tokens">
        <InputNumber
          min={1}
          max={128000}
          value={(config.max_tokens as number) ?? 2048}
          onChange={(v) => onChange('max_tokens', v)}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Form>
  );
};

export default LLMConfigForm;

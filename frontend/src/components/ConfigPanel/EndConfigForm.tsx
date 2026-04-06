import React from 'react';
import { Form, Select } from 'antd';
import { useWorkflowStore } from '../../stores/workflowStore';

const EndConfigForm: React.FC<{
  nodeId: string;
  config: Record<string, unknown>;
}> = ({ nodeId, config }) => {
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);

  return (
    <Form layout="vertical" size="small">
      <Form.Item label="输出类型">
        <Select
          value={(config.output_type as string) || 'auto'}
          onChange={(v) => updateNodeConfig(nodeId, { output_type: v })}
        >
          <Select.Option value="auto">自动</Select.Option>
          <Select.Option value="audio">音频</Select.Option>
          <Select.Option value="text">文本</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  );
};

export default EndConfigForm;

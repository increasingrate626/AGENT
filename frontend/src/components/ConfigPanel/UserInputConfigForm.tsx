import React from 'react';
import { Form, Input } from 'antd';
import { useWorkflowStore } from '../../stores/workflowStore';

const UserInputConfigForm: React.FC<{
  nodeId: string;
  config: Record<string, unknown>;
}> = ({ nodeId, config }) => {
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);

  const onChange = (key: string, value: unknown) => {
    updateNodeConfig(nodeId, { [key]: value });
  };

  return (
    <Form layout="vertical" size="small">
      <Form.Item label="变量名">
        <Input
          value={(config.variable_name as string) || 'user_input'}
          onChange={(e) => onChange('variable_name', e.target.value)}
        />
      </Form.Item>
      <Form.Item label="占位提示文本">
        <Input
          value={(config.placeholder as string) || ''}
          onChange={(e) => onChange('placeholder', e.target.value)}
        />
      </Form.Item>
    </Form>
  );
};

export default UserInputConfigForm;

import React from 'react';
import { RobotOutlined } from '@ant-design/icons';
import BaseNode from './BaseNode';

const LLMNode: React.FC<{ id: string; data: any }> = ({ id, data }) => {
  const config = data.config || {};
  return (
    <BaseNode
      id={id}
      data={data}
      color="#1677ff"
      icon={<RobotOutlined />}
      showInput={true}
      showOutput={true}
    >
      <div>模型: {config.model || 'gpt-3.5-turbo'}</div>
      <div style={{ color: '#999', marginTop: 2 }}>
        温度: {config.temperature ?? 0.7}
      </div>
    </BaseNode>
  );
};

export default LLMNode;

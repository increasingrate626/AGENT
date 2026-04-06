import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import BaseNode from './BaseNode';

const EndNode: React.FC<{ id: string; data: any }> = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      color="#8c8c8c"
      icon={<CheckCircleOutlined />}
      showInput={true}
      showOutput={false}
    >
      <div>输出: {data.config?.output_type || '自动'}</div>
    </BaseNode>
  );
};

export default EndNode;

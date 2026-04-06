import React from 'react';
import { MessageOutlined } from '@ant-design/icons';
import BaseNode from './BaseNode';

const UserInputNode: React.FC<{ id: string; data: any }> = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      data={data}
      color="#52c41a"
      icon={<MessageOutlined />}
      showInput={false}
      showOutput={true}
    >
      <div>变量: {data.config?.variable_name || 'user_input'}</div>
    </BaseNode>
  );
};

export default UserInputNode;

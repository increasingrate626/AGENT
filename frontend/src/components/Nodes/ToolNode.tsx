import React from 'react';
import { SoundOutlined } from '@ant-design/icons';
import BaseNode from './BaseNode';

const ToolNode: React.FC<{ id: string; data: any }> = ({ id, data }) => {
  const config = data.config || {};
  return (
    <BaseNode
      id={id}
      data={data}
      color="#722ed1"
      icon={<SoundOutlined />}
      showInput={true}
      showOutput={true}
    >
      <div>音色: {(config.voice as string)?.split('-').pop() || '默认'}</div>
      <div style={{ color: '#999', marginTop: 2 }}>
        语速: {config.speed || '+0%'}
      </div>
    </BaseNode>
  );
};

export default ToolNode;

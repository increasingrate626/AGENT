import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useWorkflowStore } from '../../stores/workflowStore';
import LLMConfigForm from './LLMConfigForm';
import TTSConfigForm from './TTSConfigForm';
import UserInputConfigForm from './UserInputConfigForm';
import EndConfigForm from './EndConfigForm';

const NodeConfigPanel: React.FC = () => {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const setSelectedNode = useWorkflowStore((s) => s.setSelectedNode);

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const config = node.data?.config || {};
  const nodeType = node.type;

  let configForm: React.ReactNode = null;
  switch (nodeType) {
    case 'user_input':
      configForm = <UserInputConfigForm nodeId={selectedNodeId} config={config} />;
      break;
    case 'llm':
      configForm = <LLMConfigForm nodeId={selectedNodeId} config={config} />;
      break;
    case 'tts':
      configForm = <TTSConfigForm nodeId={selectedNodeId} config={config} />;
      break;
    case 'end':
      configForm = <EndConfigForm nodeId={selectedNodeId} config={config} />;
      break;
  }

  return (
    <div
      style={{
        width: 300,
        borderLeft: '1px solid #f0f0f0',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {node.data?.label || '节点配置'}
        </span>
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={() => setSelectedNode(null)}
        />
      </div>
      <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
        {configForm}
      </div>
    </div>
  );
};

export default NodeConfigPanel;

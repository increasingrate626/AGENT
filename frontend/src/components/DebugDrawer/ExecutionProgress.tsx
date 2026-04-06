import React from 'react';
import { Steps } from 'antd';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useExecutionStore } from '../../stores/executionStore';
import { useWorkflowStore } from '../../stores/workflowStore';

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <ClockCircleOutlined style={{ color: '#d9d9d9' }} />,
  running: <LoadingOutlined style={{ color: '#1677ff' }} />,
  completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const STATUS_MAP: Record<string, 'wait' | 'process' | 'finish' | 'error'> = {
  pending: 'wait',
  running: 'process',
  completed: 'finish',
  error: 'error',
};

const ExecutionProgress: React.FC = () => {
  const nodeStatuses = useExecutionStore((s) => s.nodeStatuses);
  const nodes = useWorkflowStore((s) => s.nodes);

  const items = nodes.map((node) => {
    const status = nodeStatuses[node.id] || 'pending';
    return {
      title: node.data?.label || node.type,
      icon: STATUS_ICON[status],
      status: STATUS_MAP[status],
    };
  });

  return (
    <Steps
      direction="vertical"
      size="small"
      items={items}
      style={{ padding: '0 4px' }}
    />
  );
};

export default ExecutionProgress;

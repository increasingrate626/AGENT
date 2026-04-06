import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useExecutionStore } from '../../stores/executionStore';
import { useWorkflowStore } from '../../stores/workflowStore';

interface BaseNodeData {
  label: string;
  nodeType: string;
  config: Record<string, unknown>;
}

interface BaseNodeProps {
  id: string;
  data: BaseNodeData;
  color: string;
  icon: React.ReactNode;
  showInput?: boolean;
  showOutput?: boolean;
  children?: React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  data,
  color,
  icon,
  showInput = true,
  showOutput = true,
  children,
}) => {
  const status = useExecutionStore((s) => s.nodeStatuses[id]);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const isSelected = selectedNodeId === id;

  let borderColor = '#e5e7eb';
  let statusIcon = null;

  switch (status) {
    case 'running':
      borderColor = '#1677ff';
      statusIcon = <span className="node-status-dot running" />;
      break;
    case 'completed':
      borderColor = '#52c41a';
      statusIcon = <span className="node-status-dot completed" />;
      break;
    case 'error':
      borderColor = '#ff4d4f';
      statusIcon = <span className="node-status-dot error" />;
      break;
  }

  if (isSelected && !status) {
    borderColor = color;
  }

  return (
    <div
      className={`workflow-node ${status ? `node-${status}` : ''}`}
      style={{
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        background: '#fff',
        minWidth: 180,
        boxShadow: isSelected
          ? `0 0 0 2px ${color}40`
          : '0 1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div
        className="node-header"
        style={{
          background: color,
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {icon}
        <span>{data.label}</span>
        {statusIcon}
      </div>
      <div style={{ padding: '8px 12px', fontSize: 12, color: '#666' }}>
        {children}
      </div>
      {showInput && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: color, width: 8, height: 8 }}
        />
      )}
      {showOutput && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: color, width: 8, height: 8 }}
        />
      )}
    </div>
  );
};

export default BaseNode;

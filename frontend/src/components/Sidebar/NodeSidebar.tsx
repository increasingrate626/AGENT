import React from 'react';
import { Collapse } from 'antd';
import {
  RobotOutlined,
  SoundOutlined,
  MessageOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { SIDEBAR_CATEGORIES } from '../../constants/nodeRegistry';

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageOutlined: <MessageOutlined />,
  RobotOutlined: <RobotOutlined />,
  SoundOutlined: <SoundOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
};

const DraggableNodeItem: React.FC<{
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}> = ({ type, label, icon, color, description }) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        padding: '10px 12px',
        marginBottom: 8,
        background: '#fff',
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 6,
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <span style={{ color, fontSize: 18 }}>{ICON_MAP[icon]}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
        <div style={{ fontSize: 11, color: '#999' }}>{description}</div>
      </div>
    </div>
  );
};

const NodeSidebar: React.FC = () => {
  const items = SIDEBAR_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: <span style={{ fontWeight: 600 }}>{cat.label}</span>,
    children: (
      <div>
        {cat.nodes.map((node) => (
          <DraggableNodeItem
            key={node.type}
            type={node.type}
            label={node.label}
            icon={node.icon}
            color={node.color}
            description={node.description}
          />
        ))}
      </div>
    ),
  }));

  return (
    <div style={{ padding: '12px 8px' }}>
      <div
        style={{
          padding: '0 8px 12px',
          fontWeight: 700,
          fontSize: 15,
          color: '#333',
        }}
      >
        节点库
      </div>
      <Collapse
        defaultActiveKey={['llm', 'tool', 'io']}
        ghost
        items={items}
        size="small"
      />
    </div>
  );
};

export default NodeSidebar;

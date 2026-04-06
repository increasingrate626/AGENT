import React, { useEffect, useState } from 'react';
import { Layout, Button, Input, message, Space } from 'antd';
import {
  BugOutlined,
  SaveOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import NodeSidebar from '../Sidebar/NodeSidebar';
import FlowCanvas from '../Canvas/FlowCanvas';
import NodeConfigPanel from '../ConfigPanel/NodeConfigPanel';
import DebugDrawer from '../DebugDrawer/DebugDrawer';
import { useWorkflowStore } from '../../stores/workflowStore';
import { getWorkflows, getWorkflow, createWorkflow, updateWorkflow } from '../../api/workflow';
import { DEFAULT_CONFIGS } from '../../constants/defaultConfigs';
import type { Node, Edge } from 'reactflow';

const { Header, Sider, Content } = Layout;

function buildDefaultWorkflow(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    {
      id: 'default_input',
      type: 'user_input',
      position: { x: 300, y: 50 },
      data: {
        label: '用户输入',
        nodeType: 'user_input',
        config: { ...DEFAULT_CONFIGS.user_input },
      },
    },
    {
      id: 'default_llm',
      type: 'llm',
      position: { x: 300, y: 200 },
      data: {
        label: '大模型',
        nodeType: 'llm',
        config: {
          ...DEFAULT_CONFIGS.llm,
          system_prompt: '你是一位播客主持人。请根据用户提供的主题，创作一段生动、引人入胜的播客脚本。用适合音频朗读的对话式语气撰写。',
          prompt_template: '{{user_input}}',
        },
      },
    },
    {
      id: 'default_tts',
      type: 'tts',
      position: { x: 300, y: 400 },
      data: {
        label: '超拟人音频合成',
        nodeType: 'tts',
        config: { ...DEFAULT_CONFIGS.tts },
      },
    },
    {
      id: 'default_end',
      type: 'end',
      position: { x: 300, y: 580 },
      data: {
        label: '结束',
        nodeType: 'end',
        config: { ...DEFAULT_CONFIGS.end },
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: 'e_input_llm',
      source: 'default_input',
      target: 'default_llm',
      type: 'smoothstep',
      style: { strokeWidth: 2 },
    },
    {
      id: 'e_llm_tts',
      source: 'default_llm',
      target: 'default_tts',
      type: 'smoothstep',
      style: { strokeWidth: 2 },
    },
    {
      id: 'e_tts_end',
      source: 'default_tts',
      target: 'default_end',
      type: 'smoothstep',
      style: { strokeWidth: 2 },
    },
  ];

  return { nodes, edges };
}

const AppLayout: React.FC = () => {
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const workflowMeta = useWorkflowStore((s) => s.workflowMeta);
  const setWorkflow = useWorkflowStore((s) => s.setWorkflow);
  const setWorkflowMeta = useWorkflowStore((s) => s.setWorkflowMeta);
  const getSerializableState = useWorkflowStore((s) => s.getSerializableState);
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);

  // Load or create default workflow on mount
  useEffect(() => {
    (async () => {
      try {
        const workflows = await getWorkflows();
        if (workflows.length > 0) {
          const wf = await getWorkflow(workflows[0].id);
          // Convert backend nodes to ReactFlow nodes
          const rfNodes: Node[] = wf.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: {
              label: n.label,
              nodeType: n.type,
              config: n.config,
            },
          }));
          const rfEdges: Edge[] = wf.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            type: 'smoothstep',
            style: { strokeWidth: 2 },
          }));
          setWorkflow(
            { id: wf.id, name: wf.name, description: wf.description },
            rfNodes,
            rfEdges
          );
        } else {
          // Create default
          const { nodes, edges } = buildDefaultWorkflow();
          setWorkflow(
            { id: '', name: 'AI 播客工作流', description: '文本转播客音频流水线' },
            nodes,
            edges
          );
        }
      } catch {
        // Backend not available - load default
        const { nodes, edges } = buildDefaultWorkflow();
        setWorkflow(
          { id: '', name: 'AI 播客工作流', description: '文本转播客音频流水线' },
          nodes,
          edges
        );
      }
    })();
  }, [setWorkflow]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const state = getSerializableState();
      const payload = {
        ...workflowMeta,
        nodes: state.nodes,
        edges: state.edges,
      };

      if (workflowMeta.id) {
        await updateWorkflow(workflowMeta.id, payload);
      } else {
        const created = await createWorkflow(payload);
        setWorkflowMeta({ id: created.id });
      }
      message.success('工作流已保存');
    } catch {
      message.error('保存工作流失败');
    }
    setSaving(false);
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Left Sidebar */}
      <Sider
        width={260}
        collapsedWidth={0}
        collapsed={siderCollapsed}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
        }}
      >
        <NodeSidebar />
      </Sider>

      {/* Main area */}
      <Layout>
        {/* Toolbar */}
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 16px',
            height: 48,
            lineHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
            />
            <Input
              value={workflowMeta.name}
              onChange={(e) => setWorkflowMeta({ name: e.target.value })}
              variant="borderless"
              style={{ fontWeight: 600, fontSize: 15, width: 250 }}
            />
          </Space>
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              保存
            </Button>
            <Button
              type="primary"
              icon={<BugOutlined />}
              onClick={() => setDebugOpen(true)}
            >
              调试
            </Button>
          </Space>
        </Header>

        {/* Canvas + Config panel */}
        <Layout style={{ flex: 1 }}>
          <Content style={{ position: 'relative' }}>
            <FlowCanvas />
          </Content>
          {selectedNodeId && <NodeConfigPanel />}
        </Layout>
      </Layout>

      {/* Debug Drawer */}
      <DebugDrawer open={debugOpen} onClose={() => setDebugOpen(false)} />
    </Layout>
  );
};

export default AppLayout;

import React, { useRef, useEffect } from 'react';
import { Drawer, Button, Input, Divider, Alert, Empty } from 'antd';
import {
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useExecutionStore } from '../../stores/executionStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { startExecution, createExecutionSSE } from '../../api/execution';
import { createWorkflow, updateWorkflow } from '../../api/workflow';
import ExecutionProgress from './ExecutionProgress';
import ExecutionLogs from './ExecutionLogs';
import AudioPlayer from './AudioPlayer';
import type { ExecutionStatusEvent } from '../../types/execution';

const { TextArea } = Input;

interface DebugDrawerProps {
  open: boolean;
  onClose: () => void;
}

const DebugDrawer: React.FC<DebugDrawerProps> = ({ open, onClose }) => {
  const [inputText, setInputText] = React.useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const isRunning = useExecutionStore((s) => s.isRunning);
  const audioUrl = useExecutionStore((s) => s.audioUrl);
  const error = useExecutionStore((s) => s.error);
  const logs = useExecutionStore((s) => s.logs);
  const nodeStatuses = useExecutionStore((s) => s.nodeStatuses);
  const startExec = useExecutionStore((s) => s.startExecution);
  const handleEvent = useExecutionStore((s) => s.handleEvent);
  const reset = useExecutionStore((s) => s.reset);

  const workflowMeta = useWorkflowStore((s) => s.workflowMeta);
  const getSerializableState = useWorkflowStore((s) => s.getSerializableState);
  const nodes = useWorkflowStore((s) => s.nodes);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const handleRun = async () => {
    if (!inputText.trim()) return;

    // Close previous SSE
    eventSourceRef.current?.close();
    reset();

    try {
      // Save workflow first
      const state = getSerializableState();
      let workflowId = workflowMeta.id;

      const payload = {
        ...workflowMeta,
        nodes: state.nodes,
        edges: state.edges,
      };

      if (workflowId) {
        await updateWorkflow(workflowId, payload);
      } else {
        const created = await createWorkflow(payload);
        workflowId = created.id;
        useWorkflowStore.getState().setWorkflowMeta({ id: workflowId });
      }

      // Start execution
      const { execution_id } = await startExecution({
        workflow_id: workflowId,
        inputs: { user_input: inputText },
      });

      startExec(execution_id);

      // Connect SSE
      const es = createExecutionSSE(execution_id);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data: ExecutionStatusEvent = JSON.parse(event.data);
          handleEvent(data);

          if (data.event_type === 'workflow_complete') {
            es.close();
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es.close();
      };
    } catch (err: any) {
      useExecutionStore.getState().handleEvent({
        execution_id: '',
        event_type: 'workflow_complete',
        node_id: null,
        node_type: null,
        message: `启动失败: ${err.message || '未知错误'}`,
        timestamp: new Date().toISOString(),
        data: { error: err.message },
      });
    }
  };

  // Find user_input node placeholder
  const inputNode = nodes.find((n) => n.type === 'user_input');
  const placeholder = inputNode?.data?.config?.placeholder || '输入文本以测试工作流...';

  return (
    <Drawer
      title="调试与测试"
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      mask={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
        {/* Input */}
        <div>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholder as string}
            rows={4}
            disabled={isRunning}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRun}
              loading={isRunning}
              disabled={!inputText.trim()}
              block
            >
              {isRunning ? '运行中...' : '运行'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={reset}
              disabled={isRunning}
            >
              重置
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert
            type="error"
            message="执行出错"
            description={error}
            showIcon
            closable
          />
        )}

        {/* Progress */}
        {Object.keys(nodeStatuses).length > 0 && (
          <>
            <Divider style={{ margin: '8px 0' }}>执行进度</Divider>
            <ExecutionProgress />
          </>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <>
            <Divider style={{ margin: '8px 0' }}>音频输出</Divider>
            <AudioPlayer url={audioUrl} />
          </>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <>
            <Divider style={{ margin: '8px 0' }}>运行日志</Divider>
            <ExecutionLogs />
          </>
        )}

        {logs.length === 0 && !isRunning && (
          <Empty
            description="输入文本并点击运行来测试工作流"
            style={{ marginTop: 40 }}
          />
        )}
      </div>
    </Drawer>
  );
};

export default DebugDrawer;

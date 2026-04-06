import React, { useRef, useEffect } from 'react';
import { useExecutionStore } from '../../stores/executionStore';

const ExecutionLogs: React.FC = () => {
  const logs = useExecutionStore((s) => s.logs);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={containerRef}
      style={{
        maxHeight: 200,
        overflowY: 'auto',
        background: '#1e1e1e',
        borderRadius: 6,
        padding: '8px 12px',
        fontFamily: 'monospace',
        fontSize: 11,
        lineHeight: 1.6,
        color: '#d4d4d4',
      }}
    >
      {logs.map((log, i) => {
        const time = log.timestamp
          ? new Date(log.timestamp).toLocaleTimeString()
          : '';
        return (
          <div key={i}>
            <span style={{ color: '#6a9955' }}>[{time}]</span>{' '}
            {log.nodeType && (
              <span style={{ color: '#569cd6' }}>[{log.nodeType}]</span>
            )}{' '}
            <span>{log.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ExecutionLogs;

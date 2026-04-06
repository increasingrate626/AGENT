import React from 'react';
import { Form, Input, Slider, InputNumber, Button, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useWorkflowStore } from '../../stores/workflowStore';

interface Parameter {
  name: string;
  type: 'input' | 'reference';
  value: string;
  referenceNode?: string;
}

interface OutputParameter {
  name: string;
  type: string;
  description: string;
}

interface NodeOption {
  value: string;
  label: string;
  outputs: string[];
}

const LLMConfigForm: React.FC<{ nodeId: string; config: Record<string, unknown> }> = ({
  nodeId,
  config,
}) => {
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);

  // Get parent nodes (nodes that connect to this node)
  const parentNodes = React.useMemo(() => {
    const parentIds = edges
      .filter((e) => e.target === nodeId)
      .map((e) => e.source);

    return nodes
      .filter((n) => parentIds.includes(n.id))
      .map((n) => ({
        value: n.id,
        label: n.data?.label || n.type,
        outputs: ['text'], // Could be extended based on node type
      }));
  }, [edges, nodeId, nodes]);

  // Initialize parameters from config or use defaults
  const parameters: Parameter[] = React.useMemo(() => {
    const savedParams = config.parameters as Parameter[] | undefined;
    if (savedParams && savedParams.length > 0) {
      return savedParams;
    }
    // Default parameter for backward compatibility
    return [
      {
        name: 'user_input',
        type: 'reference',
        value: '',
        referenceNode: '',
      },
    ];
  }, [config.parameters]);

  const onChange = (key: string, value: unknown) => {
    updateNodeConfig(nodeId, { [key]: value });
  };

  const updateParameters = (params: Parameter[]) => {
    updateNodeConfig(nodeId, { parameters: params });
  };

  const addParameter = () => {
    const newParams: Parameter[] = [
      ...parameters,
      { name: '', type: 'input', value: '', referenceNode: '' },
    ];
    updateParameters(newParams);
  };

  const removeParameter = (index: number) => {
    const newParams = parameters.filter((_, i) => i !== index);
    updateParameters(newParams);
  };

  const updateParameter = (index: number, field: keyof Parameter, value: string) => {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    updateParameters(newParams);
  };

  // Build prompt template from parameters
  const promptTemplate = React.useMemo(() => {
    return parameters
      .filter((p) => p.name)
      .map((p) => `{{${p.name}}}`)
      .join('\n');
  }, [parameters]);

  // Initialize output parameters from config or use defaults
  const outputParameters: OutputParameter[] = React.useMemo(() => {
    const savedOutputParams = config.output_parameters as OutputParameter[] | undefined;
    if (savedOutputParams && savedOutputParams.length > 0) {
      return savedOutputParams;
    }
    // Default output parameter
    return [
      {
        name: 'text',
        type: 'string',
        description: 'LLM 生成的文本输出',
      },
    ];
  }, [config.output_parameters]);

  const updateOutputParameters = (params: OutputParameter[]) => {
    updateNodeConfig(nodeId, { output_parameters: params });
  };

  const addOutputParameter = () => {
    const newParams: OutputParameter[] = [
      ...outputParameters,
      { name: '', type: 'string', description: '' },
    ];
    updateOutputParameters(newParams);
  };

  const removeOutputParameter = (index: number) => {
    const newParams = outputParameters.filter((_, i) => i !== index);
    updateOutputParameters(newParams);
  };

  const updateOutputParameter = (index: number, field: keyof OutputParameter, value: string) => {
    const newParams = [...outputParameters];
    newParams[index] = { ...newParams[index], [field]: value };
    updateOutputParameters(newParams);
  };

  return (
    <Form layout="vertical" size="small">
      <Form.Item label="模型">
        <Input
          value={(config.model as string) || ''}
          onChange={(e) => onChange('model', e.target.value)}
          placeholder="deepseek-chat"
        />
      </Form.Item>
      <Form.Item label="API 地址">
        <Input
          value={(config.api_base as string) || ''}
          onChange={(e) => onChange('api_base', e.target.value)}
          placeholder="https://api.deepseek.com"
        />
      </Form.Item>
      <Form.Item label="API 密钥">
        <Input.Password
          value={(config.api_key as string) || ''}
          onChange={(e) => onChange('api_key', e.target.value)}
          placeholder="sk-..."
        />
      </Form.Item>
      <Form.Item label="温度">
        <Slider
          min={0}
          max={2}
          step={0.1}
          value={(config.temperature as number) ?? 0.7}
          onChange={(v) => onChange('temperature', v)}
        />
      </Form.Item>

      <Form.Item
        label={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>输入参数</span>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={addParameter}
            >
              添加
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {parameters.map((param, index) => (
            <div
              key={index}
              style={{
                padding: 12,
                background: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: 6,
              }}
            >
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#666' }}>参数 {index + 1}</span>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeParameter(index)}
                  disabled={parameters.length === 1}
                />
              </div>

              <Form.Item label="参数名" style={{ marginBottom: 8 }}>
                <Input
                  value={param.name}
                  onChange={(e) => updateParameter(index, 'name', e.target.value)}
                  placeholder="例如: context, question"
                />
              </Form.Item>

              <Form.Item label="参数类型" style={{ marginBottom: 8 }}>
                <Select
                  value={param.type}
                  onChange={(value: 'input' | 'reference') =>
                    updateParameter(index, 'type', value)
                  }
                  options={[
                    { label: '手动输入', value: 'input' },
                    { label: '引用节点', value: 'reference' },
                  ]}
                />
              </Form.Item>

              {param.type === 'input' ? (
                <Form.Item label="参数值" style={{ marginBottom: 0 }}>
                  <Input.TextArea
                    value={param.value}
                    onChange={(e) => updateParameter(index, 'value', e.target.value)}
                    placeholder="输入参数值..."
                    rows={2}
                  />
                </Form.Item>
              ) : (
                <Form.Item label="引用节点" style={{ marginBottom: 0 }}>
                  <Select
                    value={param.referenceNode}
                    onChange={(value: string) =>
                      updateParameter(index, 'referenceNode', value)
                    }
                    placeholder="选择前序节点"
                    options={parentNodes}
                  />
                </Form.Item>
              )}
            </div>
          ))}
        </div>

        {parameters.length === 0 && (
          <Button type="dashed" onClick={addParameter} block style={{ marginTop: 8 }}>
            <PlusOutlined /> 添加参数
          </Button>
        )}
      </Form.Item>

      <Form.Item
        label={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>输出参数</span>
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={addOutputParameter}
            >
              添加
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {outputParameters.map((param, index) => (
            <div
              key={index}
              style={{
                padding: 12,
                background: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: 6,
              }}
            >
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#666' }}>输出 {index + 1}</span>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeOutputParameter(index)}
                  disabled={outputParameters.length === 1}
                />
              </div>

              <Form.Item label="变量名" style={{ marginBottom: 8 }}>
                <Input
                  value={param.name}
                  onChange={(e) => updateOutputParameter(index, 'name', e.target.value)}
                  placeholder="例如: result, answer"
                />
              </Form.Item>

              <Form.Item label="变量类型" style={{ marginBottom: 8 }}>
                <Select
                  value={param.type}
                  onChange={(value: string) => updateOutputParameter(index, 'type', value)}
                  options={[
                    { label: 'string', value: 'string' },
                  ]}
                  disabled
                />
              </Form.Item>

              <Form.Item label="描述" style={{ marginBottom: 0 }}>
                <Input
                  value={param.description}
                  onChange={(e) => updateOutputParameter(index, 'description', e.target.value)}
                  placeholder="可选，描述该输出参数的用途"
                />
              </Form.Item>
            </div>
          ))}
        </div>

        {outputParameters.length === 0 && (
          <Button type="dashed" onClick={addOutputParameter} block style={{ marginTop: 8 }}>
            <PlusOutlined /> 添加输出参数
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default LLMConfigForm;

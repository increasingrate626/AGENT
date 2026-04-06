import React, { useEffect, useState } from 'react';
import { Form, Select, Slider, Input } from 'antd';
import { useWorkflowStore } from '../../stores/workflowStore';
import { getTTSVoices } from '../../api/execution';

const TTSConfigForm: React.FC<{ nodeId: string; config: Record<string, unknown> }> = ({
  nodeId,
  config,
}) => {
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const [voices, setVoices] = useState<
    { name: string; locale: string; gender: string; friendly_name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTTSVoices()
      .then(setVoices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onChange = (key: string, value: unknown) => {
    updateNodeConfig(nodeId, { [key]: value });
  };

  // Group voices by locale
  const groupedVoices: Record<string, typeof voices> = {};
  voices.forEach((v) => {
    if (!groupedVoices[v.locale]) groupedVoices[v.locale] = [];
    groupedVoices[v.locale].push(v);
  });

  // Parse speed as number for slider
  const speedStr = (config.speed as string) || '+0%';
  const speedNum = parseInt(speedStr.replace('%', '').replace('+', ''), 10) || 0;

  const pitchStr = (config.pitch as string) || '+0Hz';
  const pitchNum = parseInt(pitchStr.replace('Hz', '').replace('+', ''), 10) || 0;

  return (
    <Form layout="vertical" size="small">
      <Form.Item label="音色">
        <Select
          value={(config.voice as string) || 'zh-CN-XiaoxiaoNeural'}
          onChange={(v) => onChange('voice', v)}
          loading={loading}
          showSearch
          placeholder="选择音色"
          optionFilterProp="label"
        >
          {Object.entries(groupedVoices).map(([locale, vs]) => (
            <Select.OptGroup key={locale} label={locale}>
              {vs.map((v) => (
                <Select.Option key={v.name} value={v.name} label={v.friendly_name}>
                  {v.friendly_name} ({v.gender})
                </Select.Option>
              ))}
            </Select.OptGroup>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label={`语速: ${speedNum >= 0 ? '+' : ''}${speedNum}%`}>
        <Slider
          min={-50}
          max={100}
          step={5}
          value={speedNum}
          onChange={(v) => onChange('speed', `${v >= 0 ? '+' : ''}${v}%`)}
        />
      </Form.Item>
      <Form.Item label={`音调: ${pitchNum >= 0 ? '+' : ''}${pitchNum}Hz`}>
        <Slider
          min={-20}
          max={20}
          step={1}
          value={pitchNum}
          onChange={(v) => onChange('pitch', `${v >= 0 ? '+' : ''}${v}Hz`)}
        />
      </Form.Item>
      <Form.Item label="输出格式">
        <Select
          value={(config.output_format as string) || 'mp3'}
          onChange={(v) => onChange('output_format', v)}
        >
          <Select.Option value="mp3">MP3</Select.Option>
          <Select.Option value="wav">WAV</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  );
};

export default TTSConfigForm;

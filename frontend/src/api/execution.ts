import api from './index';
import type { ExecutionRequest } from '../types/execution';

export async function startExecution(
  request: ExecutionRequest
): Promise<{ execution_id: string }> {
  const res = await api.post('/execute', request);
  return res.data;
}

export function createExecutionSSE(executionId: string): EventSource {
  return new EventSource(`/api/v1/execute/${executionId}/stream`);
}

export async function getTTSVoices(): Promise<
  { name: string; locale: string; gender: string; friendly_name: string }[]
> {
  const res = await api.get('/tts/voices');
  return res.data.voices;
}

import api from './index';
import type { WorkflowDefinition, WorkflowSummary } from '../types/workflow';

export async function getWorkflows(): Promise<WorkflowSummary[]> {
  const res = await api.get('/workflows');
  return res.data;
}

export async function getWorkflow(id: string): Promise<WorkflowDefinition> {
  const res = await api.get(`/workflows/${id}`);
  return res.data;
}

export async function createWorkflow(
  data: Partial<WorkflowDefinition>
): Promise<WorkflowDefinition> {
  const res = await api.post('/workflows', data);
  return res.data;
}

export async function updateWorkflow(
  id: string,
  data: Partial<WorkflowDefinition>
): Promise<WorkflowDefinition> {
  const res = await api.put(`/workflows/${id}`, data);
  return res.data;
}

export async function deleteWorkflow(id: string): Promise<void> {
  await api.delete(`/workflows/${id}`);
}

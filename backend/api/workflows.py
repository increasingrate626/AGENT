from fastapi import APIRouter, HTTPException

from models.workflow import WorkflowDefinition, WorkflowSummary
from storage.workflow_store import workflow_store

router = APIRouter(prefix="/workflows", tags=["workflows"])


@router.get("", response_model=list[WorkflowSummary])
async def list_workflows():
    return workflow_store.list_all()


@router.post("", response_model=WorkflowDefinition)
async def create_workflow(workflow: WorkflowDefinition):
    workflow.id = ""  # force new ID generation
    return workflow_store.save(workflow)


@router.get("/{workflow_id}", response_model=WorkflowDefinition)
async def get_workflow(workflow_id: str):
    wf = workflow_store.get(workflow_id)
    if wf is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@router.put("/{workflow_id}", response_model=WorkflowDefinition)
async def update_workflow(workflow_id: str, workflow: WorkflowDefinition):
    existing = workflow_store.get(workflow_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow.id = workflow_id
    workflow.created_at = existing.created_at
    return workflow_store.save(workflow)


@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str):
    if not workflow_store.delete(workflow_id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"success": True}

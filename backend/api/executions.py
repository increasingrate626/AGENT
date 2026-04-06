from __future__ import annotations

import asyncio
import json
import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from engine.context import ExecutionContext
from engine.runner import run_workflow
from models.execution import ExecutionRequest
from storage.workflow_store import workflow_store
from services.tts_service import list_voices

router = APIRouter(tags=["executions"])

# In-memory execution store (single-server MVP)
executions: dict[str, ExecutionContext] = {}


@router.post("/execute")
async def start_execution(request: ExecutionRequest):
    workflow = workflow_store.get(request.workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    execution_id = str(uuid.uuid4())
    context = ExecutionContext(
        execution_id=execution_id,
        initial_inputs=request.inputs,
    )
    executions[execution_id] = context

    # Spawn background task
    asyncio.create_task(run_workflow(workflow, request.inputs, context))

    return {"execution_id": execution_id}


@router.get("/execute/{execution_id}/stream")
async def stream_execution(execution_id: str):
    context = executions.get(execution_id)
    if context is None:
        raise HTTPException(status_code=404, detail="Execution not found")

    async def event_generator():
        while True:
            try:
                event = await asyncio.wait_for(
                    context.event_queue.get(), timeout=30.0
                )
                data = event.model_dump_json()
                yield f"data: {data}\n\n"

                if event.event_type == "workflow_complete":
                    break
            except asyncio.TimeoutError:
                # Send keepalive
                yield f": keepalive\n\n"

                if context.is_complete:
                    break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/tts/voices")
async def get_tts_voices():
    voices = await list_voices()
    return {"voices": voices}

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel


class ExecutionRequest(BaseModel):
    workflow_id: str
    inputs: dict[str, str] = {}


class ExecutionStatusEvent(BaseModel):
    execution_id: str
    event_type: str  # node_start, node_complete, node_error, workflow_complete, log
    node_id: Optional[str] = None
    node_type: Optional[str] = None
    message: str = ""
    timestamp: str = ""
    data: dict[str, Any] = {}

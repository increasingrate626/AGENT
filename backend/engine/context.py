from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any

from models.execution import ExecutionStatusEvent
from datetime import datetime, timezone


@dataclass
class ExecutionContext:
    execution_id: str
    initial_inputs: dict[str, str] = field(default_factory=dict)
    variables: dict[str, dict[str, Any]] = field(default_factory=dict)
    event_queue: asyncio.Queue = field(default_factory=asyncio.Queue)
    is_complete: bool = False
    error: str | None = None

    async def push_event(
        self,
        event_type: str,
        node_id: str | None = None,
        node_type: str | None = None,
        message: str = "",
        data: dict[str, Any] | None = None,
    ):
        event = ExecutionStatusEvent(
            execution_id=self.execution_id,
            event_type=event_type,
            node_id=node_id,
            node_type=node_type,
            message=message,
            timestamp=datetime.now(timezone.utc).isoformat(),
            data=data or {},
        )
        await self.event_queue.put(event)

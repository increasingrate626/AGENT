from __future__ import annotations

from typing import Any

from engine.context import ExecutionContext
from nodes.base import BaseNodeExecutor


class EndNodeExecutor(BaseNodeExecutor):
    async def execute(
        self,
        node_id: str,
        config: dict[str, Any],
        inputs: dict[str, Any],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        # Collect all inputs and pass through
        result: dict[str, Any] = {}
        for key, value in inputs.items():
            if isinstance(value, dict):
                result.update(value)
            else:
                result[key] = value

        return result

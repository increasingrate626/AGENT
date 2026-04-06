from __future__ import annotations

from typing import Any

from engine.context import ExecutionContext
from nodes.base import BaseNodeExecutor


class UserInputNodeExecutor(BaseNodeExecutor):
    async def execute(
        self,
        node_id: str,
        config: dict[str, Any],
        inputs: dict[str, Any],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        variable_name = config.get("variable_name", "user_input")
        text = context.initial_inputs.get(variable_name, "")
        return {"text": text}

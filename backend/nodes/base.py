from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from engine.context import ExecutionContext


class BaseNodeExecutor(ABC):
    @abstractmethod
    async def execute(
        self,
        node_id: str,
        config: dict[str, Any],
        inputs: dict[str, Any],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        """Execute the node and return output dict."""
        ...

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from config import settings
from models.workflow import WorkflowDefinition, WorkflowSummary


class WorkflowStore:
    def __init__(self, base_dir: Path | None = None):
        self.base_dir = base_dir or settings.workflows_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, workflow_id: str) -> Path:
        return self.base_dir / f"{workflow_id}.json"

    def list_all(self) -> list[WorkflowSummary]:
        results = []
        for f in self.base_dir.glob("*.json"):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                results.append(
                    WorkflowSummary(
                        id=data.get("id", f.stem),
                        name=data.get("name", "Untitled"),
                        description=data.get("description", ""),
                        node_count=len(data.get("nodes", [])),
                        updated_at=data.get("updated_at", ""),
                    )
                )
            except (json.JSONDecodeError, KeyError):
                continue
        return sorted(results, key=lambda w: w.updated_at, reverse=True)

    def get(self, workflow_id: str) -> WorkflowDefinition | None:
        path = self._path(workflow_id)
        if not path.exists():
            return None
        data = json.loads(path.read_text(encoding="utf-8"))
        return WorkflowDefinition(**data)

    def save(self, workflow: WorkflowDefinition) -> WorkflowDefinition:
        now = datetime.now(timezone.utc).isoformat()
        if not workflow.id:
            workflow.id = str(uuid.uuid4())
            workflow.created_at = now
        workflow.updated_at = now
        path = self._path(workflow.id)
        path.write_text(
            workflow.model_dump_json(indent=2), encoding="utf-8"
        )
        return workflow

    def delete(self, workflow_id: str) -> bool:
        path = self._path(workflow_id)
        if path.exists():
            path.unlink()
            return True
        return False


workflow_store = WorkflowStore()

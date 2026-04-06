from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class NodeType(str, Enum):
    USER_INPUT = "user_input"
    LLM = "llm"
    TTS = "tts"
    END = "end"


class Position(BaseModel):
    x: float = 0
    y: float = 0


class UserInputConfig(BaseModel):
    variable_name: str = "user_input"
    placeholder: str = "Please enter text..."


class LLMConfig(BaseModel):
    model: str = "gpt-3.5-turbo"
    api_base: str = ""
    api_key: str = ""
    system_prompt: str = ""
    prompt_template: str = "{{user_input}}"
    temperature: float = 0.7
    max_tokens: int = 2048
    top_p: float = 1.0


class TTSConfig(BaseModel):
    voice: str = "zh-CN-XiaoxiaoNeural"
    speed: str = "+0%"
    pitch: str = "+0Hz"
    output_format: str = "mp3"


class EndConfig(BaseModel):
    output_type: str = "auto"


class WorkflowNode(BaseModel):
    id: str
    type: NodeType
    label: str = ""
    position: Position = Field(default_factory=Position)
    config: dict[str, Any] = Field(default_factory=dict)


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str = "output"
    targetHandle: str = "input"


class WorkflowDefinition(BaseModel):
    id: str = ""
    name: str = "Untitled Workflow"
    description: str = ""
    nodes: list[WorkflowNode] = Field(default_factory=list)
    edges: list[WorkflowEdge] = Field(default_factory=list)
    created_at: str = ""
    updated_at: str = ""


class WorkflowSummary(BaseModel):
    id: str
    name: str
    description: str
    node_count: int
    updated_at: str

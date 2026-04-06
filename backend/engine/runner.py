from __future__ import annotations

import asyncio
import traceback
from collections import defaultdict, deque
from typing import Any

from engine.context import ExecutionContext
from models.workflow import WorkflowDefinition, WorkflowNode, NodeType
from nodes.base import BaseNodeExecutor
from nodes.user_input import UserInputNodeExecutor
from nodes.llm_node import LLMNodeExecutor
from nodes.tts_node import TTSNodeExecutor
from nodes.end_node import EndNodeExecutor

# Node executor registry
EXECUTOR_REGISTRY: dict[str, BaseNodeExecutor] = {
    NodeType.USER_INPUT: UserInputNodeExecutor(),
    NodeType.LLM: LLMNodeExecutor(),
    NodeType.TTS: TTSNodeExecutor(),
    NodeType.END: EndNodeExecutor(),
}


def topological_sort(
    nodes: list[WorkflowNode],
    edges: list[dict],
) -> list[str]:
    """Kahn's algorithm for topological sort."""
    node_ids = {n.id for n in nodes}
    in_degree: dict[str, int] = {nid: 0 for nid in node_ids}
    adjacency: dict[str, list[str]] = defaultdict(list)

    for edge in edges:
        src = edge["source"] if isinstance(edge, dict) else edge.source
        tgt = edge["target"] if isinstance(edge, dict) else edge.target
        adjacency[src].append(tgt)
        in_degree[tgt] = in_degree.get(tgt, 0) + 1

    queue = deque([nid for nid, deg in in_degree.items() if deg == 0])
    order = []

    while queue:
        nid = queue.popleft()
        order.append(nid)
        for neighbor in adjacency[nid]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(node_ids):
        raise ValueError("Workflow graph contains a cycle")

    return order


def get_parent_map(edges: list) -> dict[str, list[str]]:
    """Build map of node_id -> [parent_node_ids]."""
    parents: dict[str, list[str]] = defaultdict(list)
    for edge in edges:
        src = edge["source"] if isinstance(edge, dict) else edge.source
        tgt = edge["target"] if isinstance(edge, dict) else edge.target
        parents[tgt].append(src)
    return parents


async def run_workflow(
    workflow: WorkflowDefinition,
    inputs: dict[str, str],
    context: ExecutionContext,
):
    """Execute workflow nodes in topological order."""
    try:
        node_map = {n.id: n for n in workflow.nodes}
        edges_raw = [e.model_dump() for e in workflow.edges]
        order = topological_sort(workflow.nodes, edges_raw)
        parent_map = get_parent_map(edges_raw)

        await context.push_event(
            "log",
            message=f"Starting workflow '{workflow.name}' with {len(order)} nodes",
        )

        for node_id in order:
            node = node_map[node_id]
            executor = EXECUTOR_REGISTRY.get(node.type)

            if executor is None:
                await context.push_event(
                    "node_error",
                    node_id=node_id,
                    node_type=node.type,
                    message=f"No executor for node type: {node.type}",
                )
                continue

            # Push node_start event
            await context.push_event(
                "node_start",
                node_id=node_id,
                node_type=node.type,
                message=f"Executing {node.label or node.type}",
            )

            try:
                # Gather inputs from parent nodes
                node_inputs: dict[str, Any] = {}
                for parent_id in parent_map.get(node_id, []):
                    if parent_id in context.variables:
                        node_inputs[parent_id] = context.variables[parent_id]

                # Execute node
                result = await executor.execute(
                    node_id=node_id,
                    config=node.config,
                    inputs=node_inputs,
                    context=context,
                )

                # Store result
                context.variables[node_id] = result

                # Push node_complete event
                data: dict[str, Any] = {}
                if "text" in result:
                    text = result["text"]
                    data["output_text"] = (
                        text[:200] + "..." if len(text) > 200 else text
                    )
                if "audio_url" in result:
                    data["audio_url"] = result["audio_url"]

                await context.push_event(
                    "node_complete",
                    node_id=node_id,
                    node_type=node.type,
                    message=f"Completed {node.label or node.type}",
                    data=data,
                )

            except Exception as e:
                await context.push_event(
                    "node_error",
                    node_id=node_id,
                    node_type=node.type,
                    message=f"Error: {str(e)}",
                    data={"error": traceback.format_exc()},
                )
                context.error = str(e)
                break

        # Workflow complete
        final_data: dict[str, Any] = {}
        # Find end node output
        for node in workflow.nodes:
            if node.type == NodeType.END and node.id in context.variables:
                final_data = context.variables[node.id]
                break

        await context.push_event(
            "workflow_complete",
            message="Workflow execution completed",
            data=final_data,
        )

    except Exception as e:
        await context.push_event(
            "workflow_complete",
            message=f"Workflow failed: {str(e)}",
            data={"error": traceback.format_exc()},
        )
    finally:
        context.is_complete = True

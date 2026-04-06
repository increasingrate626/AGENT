from __future__ import annotations

from typing import Any

from engine.context import ExecutionContext
from nodes.base import BaseNodeExecutor
from services.llm_service import call_llm, interpolate_template


class LLMNodeExecutor(BaseNodeExecutor):
    async def execute(
        self,
        node_id: str,
        config: dict[str, Any],
        inputs: dict[str, Any],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        # Build variable pool from all inputs
        variables: dict[str, Any] = {}
        for parent_id, parent_output in inputs.items():
            if isinstance(parent_output, dict):
                variables.update(parent_output)
                # Also expose parent output as {{parent_node_id}}
                variables[parent_id] = parent_output.get("text", "")
            else:
                variables[parent_id] = parent_output

        # Also include initial inputs
        variables.update(context.initial_inputs)

        # Handle new dynamic parameters if present
        parameters = config.get("parameters")
        if parameters and isinstance(parameters, list):
            # Build prompt template and variables from dynamic parameters
            prompt_parts = []
            for param in parameters:
                param_name = param.get("name", "")
                if not param_name:
                    continue

                param_type = param.get("type", "input")
                if param_type == "reference":
                    # Get value from referenced node
                    ref_node = param.get("referenceNode", "")
                    if ref_node in variables:
                        variables[param_name] = variables[ref_node]
                    prompt_parts.append(f"{{{{{param_name}}}}}")
                else:
                    # Use direct input value
                    param_value = param.get("value", "")
                    variables[param_name] = param_value
                    prompt_parts.append(f"{{{{{param_name}}}}}")

            prompt_template = "\n".join(prompt_parts) if prompt_parts else "{{user_input}}"
        else:
            # Fallback to legacy prompt_template
            prompt_template = config.get("prompt_template", "{{user_input}}")

        prompt = interpolate_template(prompt_template, variables)
        system_prompt = config.get("system_prompt", "")

        await context.push_event(
            "log",
            node_id=node_id,
            node_type="llm",
            message=f"Calling LLM with prompt: {prompt[:100]}...",
        )

        text = await call_llm(
            prompt=prompt,
            system_prompt=system_prompt,
            model=config.get("model", "gpt-3.5-turbo"),
            api_base=config.get("api_base", ""),
            api_key=config.get("api_key", ""),
            temperature=config.get("temperature", 0.7),
            max_tokens=config.get("max_tokens", 2048),
            top_p=config.get("top_p", 1.0),
        )

        return {"text": text}

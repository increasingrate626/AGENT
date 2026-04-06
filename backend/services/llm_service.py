from __future__ import annotations

import re
from typing import Any

from openai import AsyncOpenAI


async def call_llm(
    prompt: str,
    system_prompt: str = "",
    model: str = "gpt-3.5-turbo",
    api_base: str = "",
    api_key: str = "",
    temperature: float = 0.7,
    max_tokens: int = 2048,
    top_p: float = 1.0,
) -> str:
    from config import settings

    base_url = api_base or settings.openai_api_base
    key = api_key or settings.openai_api_key

    # Normalize base_url: remove trailing /v1 if present, as SDK adds it
    if base_url.endswith("/v1"):
        base_url = base_url[:-3]

    client = AsyncOpenAI(api_key=key, base_url=base_url)

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=top_p,
    )

    return response.choices[0].message.content or ""


def interpolate_template(template: str, variables: dict[str, Any]) -> str:
    """Replace {{var}} placeholders with values from variables dict."""

    def replacer(match: re.Match) -> str:
        key = match.group(1).strip()
        val = variables.get(key, "")
        if isinstance(val, dict):
            return val.get("text", str(val))
        return str(val)

    return re.sub(r"\{\{(.+?)\}\}", replacer, template)

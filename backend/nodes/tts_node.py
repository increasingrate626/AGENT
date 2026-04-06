from __future__ import annotations

from typing import Any

from engine.context import ExecutionContext
from nodes.base import BaseNodeExecutor
from services.tts_service import synthesize_audio


class TTSNodeExecutor(BaseNodeExecutor):
    async def execute(
        self,
        node_id: str,
        config: dict[str, Any],
        inputs: dict[str, Any],
        context: ExecutionContext,
    ) -> dict[str, Any]:
        # Get text from parent node output
        text = ""
        for parent_output in inputs.values():
            if isinstance(parent_output, dict) and "text" in parent_output:
                text = parent_output["text"]
                break

        if not text:
            raise ValueError("TTS node received no text input")

        await context.push_event(
            "log",
            node_id=node_id,
            node_type="tts",
            message=f"Synthesizing audio ({len(text)} chars)...",
        )

        voice = config.get("voice", "zh-CN-XiaoxiaoNeural")
        speed = config.get("speed", "+0%")
        pitch = config.get("pitch", "+0Hz")
        output_format = config.get("output_format", "mp3")

        _, audio_url = await synthesize_audio(
            text=text,
            voice=voice,
            speed=speed,
            pitch=pitch,
            output_format=output_format,
        )

        return {"text": text, "audio_url": audio_url}

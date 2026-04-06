from __future__ import annotations

import edge_tts
from pathlib import Path

from config import settings


async def synthesize_audio(
    text: str,
    voice: str = "",
    speed: str = "+0%",
    pitch: str = "+0Hz",
    output_format: str = "mp3",
    output_path: Path | None = None,
) -> Path:
    voice = voice or settings.tts_default_voice

    if output_path is None:
        import uuid
        filename = f"{uuid.uuid4()}.{output_format}"
        output_path = settings.audio_dir / filename

    output_path.parent.mkdir(parents=True, exist_ok=True)

    communicate = edge_tts.Communicate(text, voice, rate=speed, pitch=pitch)
    await communicate.save(str(output_path))

    return output_path


async def list_voices() -> list[dict]:
    voices = await edge_tts.list_voices()
    return [
        {
            "name": v["Name"],
            "locale": v["Locale"],
            "gender": v["Gender"],
            "friendly_name": v.get("FriendlyName", v["Name"]),
        }
        for v in voices
    ]

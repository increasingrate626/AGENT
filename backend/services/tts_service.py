from __future__ import annotations

import edge_tts
from pathlib import Path

from config import settings
from services import minio_service


async def synthesize_audio(
    text: str,
    voice: str = "",
    speed: str = "+0%",
    pitch: str = "+0Hz",
    output_format: str = "mp3",
    output_path: Path | None = None,
) -> tuple[Path, str]:
    """Synthesize audio and upload to MinIO.

    Returns:
        tuple: (local_path, minio_url)
    """
    voice = voice or settings.tts_default_voice

    if output_path is None:
        import uuid
        filename = f"{uuid.uuid4()}.{output_format}"
        output_path = settings.audio_dir / filename

    output_path.parent.mkdir(parents=True, exist_ok=True)

    communicate = edge_tts.Communicate(text, voice, rate=speed, pitch=pitch)
    await communicate.save(str(output_path))

    # Upload to MinIO (fallback to local URL if MinIO unavailable)
    minio_path = f"audio/{output_path.name}"
    content_type = "audio/mpeg" if output_format == "mp3" else "audio/wav"
    minio_url = minio_service.upload_file_from_path(minio_path, str(output_path), content_type)

    return output_path, minio_url


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

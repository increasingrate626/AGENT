from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_api_base: str = "https://api.openai.com/v1"
    openai_default_model: str = "gpt-3.5-turbo"

    tts_default_voice: str = "zh-CN-XiaoxiaoNeural"
    tts_default_speed: str = "+0%"
    tts_default_pitch: str = "+0Hz"

    data_dir: Path = Path(__file__).parent / "data"
    workflows_dir: Path = Path(__file__).parent / "data" / "workflows"
    audio_dir: Path = Path(__file__).parent / "data" / "audio"

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

# Ensure directories exist
settings.workflows_dir.mkdir(parents=True, exist_ok=True)
settings.audio_dir.mkdir(parents=True, exist_ok=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import settings
from api.workflows import router as workflows_router
from api.executions import router as executions_router

app = FastAPI(title="AI Agent Workflow Platform", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
api_v1_prefix = "/api/v1"
app.include_router(workflows_router, prefix=api_v1_prefix)
app.include_router(executions_router, prefix=api_v1_prefix)


# Serve audio files - try local first, then MinIO
@app.get(f"{api_v1_prefix}/audio/{{filename}}")
async def get_audio(filename: str):
    import os
    from services.minio_service import get_minio_client
    from config import settings

    local_path = settings.audio_dir / filename

    # If file exists locally, serve it
    if local_path.exists():
        return FileResponse(
            local_path,
            media_type="audio/mpeg",
            filename=filename,
        )

    # Try to get from MinIO
    try:
        client = get_minio_client()
        if client:
            from services.minio_service import _minio
            bucket_name = _minio["bucket_name"]
            minio_path = f"audio/{filename}"
            # Download from MinIO and save locally
            client.fget_object(bucket_name, minio_path, str(local_path))
            return FileResponse(
                local_path,
                media_type="audio/mpeg",
                filename=filename,
            )
    except Exception as e:
        print(f"MinIO audio fetch failed: {e}")

    return {"error": "Audio file not found"}


@app.get(f"{api_v1_prefix}/health")
async def health():
    return {"status": "ok"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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

# Serve generated audio files
app.mount(
    f"{api_v1_prefix}/audio",
    StaticFiles(directory=str(settings.audio_dir)),
    name="audio",
)


@app.get(f"{api_v1_prefix}/health")
async def health():
    return {"status": "ok"}

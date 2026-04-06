# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

AI Agent Workflow Platform - a visual AI workflow orchestration tool. Users can drag-and-drop nodes (User Input, LLM, TTS, End) to build and execute AI-powered workflows.

## Common Commands

### Backend (Python/FastAPI)
```bash
cd backend

# Setup (first time)
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# Start dev server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Config
# Create backend/.env with:
#   OPENAI_API_KEY=your_api_key_here
#   OPENAI_API_BASE=https://api.openai.com/v1
```

### Frontend (React/TypeScript/Vite)
```bash
cd frontend

# Setup (first time)
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Running Both Services
- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- Frontend API calls are proxied via Vite config to the backend

## Architecture

### Backend Structure (`backend/`)

```
backend/
  main.py              # FastAPI app entry point, CORS, routes, static file mounts
  config.py            # Pydantic settings, loads .env, manages data directories
  api/
    workflows.py       # CRUD endpoints for workflows (GET/POST/PUT/DELETE /workflows)
    executions.py      # Workflow execution endpoints (POST /execute, SSE stream, TTS voices)
  engine/
    runner.py          # Workflow execution engine using topological sort (Kahn's algorithm)
    context.py         # Execution context with async event queue for SSE streaming
  models/
    workflow.py        # Pydantic models: WorkflowDefinition, WorkflowNode, WorkflowEdge, NodeType enum, config models
    execution.py       # Execution request/response models
  nodes/
    base.py            # Abstract BaseNodeExecutor class
    user_input.py      # User input node executor
    llm_node.py        # LLM node executor (OpenAI API)
    tts_node.py        # TTS node executor (Edge TTS)
    end_node.py        # End node executor
  services/
    llm_service.py     # OpenAI LLM service wrapper
    tts_service.py     # Edge TTS service wrapper
  storage/
    workflow_store.py  # File-based JSON storage for workflows (backend/data/workflows/)
```

**Key patterns:**
- Workflows are stored as JSON files in `backend/data/workflows/`
- Audio files from TTS are stored in `backend/data/audio/` and served via FastAPI StaticFiles
- Execution uses SSE (Server-Sent Events) for real-time status streaming
- Node executors follow a registry pattern in `EXECUTOR_REGISTRY` (runner.py:17-22)
- Workflow execution uses topological sort to determine node execution order

### Frontend Structure (`frontend/src/`)

```
frontend/src/
  App.tsx              # Root component with ReactFlowProvider
  main.tsx             # React entry point
  api/
    index.ts           # Axios instance (baseURL: /api/v1)
    workflow.ts        # Workflow API functions
    execution.ts       # Execution API functions (start, SSE stream, TTS voices)
  stores/
    workflowStore.ts   # Zustand store: nodes, edges, selection, serialization
    executionStore.ts  # Zustand store: execution status, logs, audio URL, error handling
  components/
    Layout/
      AppLayout.tsx    # Main layout with sidebar, canvas, toolbar, config panel
    Canvas/
      FlowCanvas.tsx   # React Flow canvas component
    Nodes/
      BaseNode.tsx     # Base node component
      UserInputNode.tsx, LLMNode.tsx, ToolNode.tsx, EndNode.tsx
    ConfigPanel/
      NodeConfigPanel.tsx  # Dynamic config panel based on selected node type
      UserInputConfigForm.tsx, LLMConfigForm.tsx, TTSConfigForm.tsx, EndConfigForm.tsx
    Sidebar/           # Node palette for drag-and-drop
    DebugDrawer/       # Execution debug panel (logs, progress, audio player)
  constants/
    nodeRegistry.ts    # Node registry with icons, colors, categories
    defaultConfigs.ts  # Default configuration for each node type
  types/
    workflow.ts        # TypeScript types for workflow nodes/edges
    execution.ts       # TypeScript types for execution status/events
```

**Key patterns:**
- State management uses Zustand (two stores: workflowStore, executionStore)
- React Flow handles the visual graph editor (nodes, edges, connections)
- Node registry maps node types to UI metadata (nodeRegistry.ts)
- Execution status is streamed via SSE (EventSource in execution.ts:11-12)
- Serializable workflow state is generated via `getSerializableState()` in workflowStore

### Adding New Node Types

1. **Backend:** Create executor in `backend/nodes/` extending `BaseNodeExecutor`, register in `EXECUTOR_REGISTRY` (runner.py)
2. **Frontend:** Add to `NODE_REGISTRY` (nodeRegistry.ts), create node component in `Nodes/`, create config form in `ConfigPanel/`, add type to `NodeType` enum in both backend and frontend

## API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/{id}` - Get workflow
- `PUT /api/v1/workflows/{id}` - Update workflow
- `DELETE /api/v1/workflows/{id}` - Delete workflow
- `POST /api/v1/execute` - Execute workflow (returns execution_id)
- `GET /api/v1/execute/{execution_id}/stream` - SSE stream for execution status
- `GET /api/v1/tts/voices` - List available TTS voices

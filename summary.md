# AI Agent Workflow Platform - 项目概述

## 项目简介

AI Agent Workflow Platform 是一个可视化 AI 工作流编排平台，允许用户通过拖拽方式构建和执行 AI 驱动的自动化工作流。

## 核心功能

### 1. 可视化工作流编辑器
- 基于 React Flow 的节点式编辑器
- 支持拖拽创建和连接节点
- 实时配置节点参数

### 2. 节点类型
| 节点类型 | 功能描述 |
|---------|---------|
| User Input | 用户输入节点，接收文本输入 |
| LLM | 大语言模型节点，支持 GPT 等模型 |
| TTS | 文本转语音节点，使用 Edge TTS |
| End | 结束节点，输出最终结果 |

### 3. 工作流执行引擎
- 异步执行工作流
- 支持执行状态追踪
- 音频文件生成与播放

## 技术架构

### 后端 (Backend)
- **框架**: FastAPI + Python
- **核心依赖**:
  - FastAPI 0.115.0+ - Web 框架
  - OpenAI 1.50.0+ - LLM 服务
  - Edge-TTS 6.1.0+ - 语音合成
  - Pydantic - 数据验证

### 前端 (Frontend)
- **框架**: React 19 + TypeScript + Vite
- **核心依赖**:
  - React Flow 11.11.4+ - 流程图编辑器
  - Ant Design 6.3.5+ - UI 组件库
  - Zustand 5.0.12+ - 状态管理
  - Axios - HTTP 客户端

## 项目结构

```
.
├── backend/              # FastAPI 后端
│   ├── api/             # API 路由
│   ├── engine/          # 执行引擎
│   ├── models/          # 数据模型
│   ├── nodes/           # 节点执行器
│   ├── services/        # 业务服务
│   └── storage/         # 数据存储
│
└── frontend/            # React 前端
    ├── src/
    │   ├── api/        # API 调用
    │   ├── components/ # React 组件
    │   ├── stores/     # 状态管理
    │   └── types/      # TypeScript 类型
    └── dist/           # 构建输出
```

## 快速开始

### 启动后端
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 启动前端
```bash
cd frontend
npm install
npm run dev
```

## API 端点

- `GET /api/v1/health` - 健康检查
- `GET /api/v1/workflows` - 获取工作流列表
- `POST /api/v1/workflows` - 创建工作流
- `GET /api/v1/workflows/{id}` - 获取工作流详情
- `PUT /api/v1/workflows/{id}` - 更新工作流
- `DELETE /api/v1/workflows/{id}` - 删除工作流
- `POST /api/v1/workflows/{id}/execute` - 执行工作流
- `GET /api/v1/executions/{id}` - 获取执行状态

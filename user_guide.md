# AI Agent Workflow Platform - 用户指南

## 目录
1. [环境准备](#环境准备)
2. [安装部署](#安装部署)
3. [快速入门](#快速入门)
4. [功能详解](#功能详解)
5. [节点配置](#节点配置)
6. [故障排查](#故障排查)

---

## 环境准备

### 系统要求
- Python 3.10+
- Node.js 18+
- Windows / macOS / Linux

### 必需配置
创建 `backend/.env` 文件：
```env
# OpenAI 配置（用于 LLM 节点）
OPENAI_API_KEY=your_api_key_here
OPENAI_API_BASE=https://api.openai.com/v1

# 可选：自定义配置
CORS_ORIGINS=["http://localhost:5173"]
```

---

## 安装部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd ai-agent-workflow-platform
```

### 2. 安装后端依赖
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. 安装前端依赖
```bash
cd ../frontend
npm install
```

### 4. 启动服务

**终端 1 - 启动后端：**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**终端 2 - 启动前端：**
```bash
cd frontend
npm run dev
```

### 5. 访问应用
打开浏览器访问：`http://localhost:5173`

---

## 快速入门

### 创建第一个工作流

#### 步骤 1：创建工作流
1. 点击「新建工作流」按钮
2. 输入工作流名称和描述
3. 点击「创建」

#### 步骤 2：添加节点
从左侧侧边栏拖拽节点到画布：
1. **User Input** 节点 - 接收用户输入
2. **LLM** 节点 - 处理文本生成
3. **End** 节点 - 输出结果

#### 步骤 3：连接节点
- 点击节点边缘的连接点
- 拖拽到目标节点的连接点
- 形成完整的数据流

#### 步骤 4：配置节点
双击节点打开配置面板：
- **LLM 节点**：设置模型、系统提示词、温度等参数
- **User Input 节点**：设置变量名和占位符

#### 步骤 5：执行工作流
1. 点击「执行」按钮
2. 在弹出的输入框中输入测试文本
3. 查看执行进度和结果

---

## 功能详解

### 工作流编辑器

#### 画布操作
| 操作 | 说明 |
|-----|------|
| 拖拽节点 | 从侧边栏拖拽到画布 |
| 连接节点 | 点击连接点并拖拽到目标 |
| 选中节点 | 单击节点选中，显示配置面板 |
| 删除节点 | 选中后按 Delete 键 |
| 平移画布 | 按住空格拖拽 |
| 缩放 | 使用鼠标滚轮 |

#### 工具栏
- **保存**：保存当前工作流
- **执行**：运行工作流
- **清空**：清空画布
- **撤销/重做**：操作历史

### 执行调试

#### 执行面板
- **进度条**：显示执行进度
- **日志输出**：查看执行日志
- **音频播放**：播放生成的语音（如果有 TTS 节点）

#### 执行状态
- `pending` - 等待执行
- `running` - 执行中
- `completed` - 执行完成
- `failed` - 执行失败

---

## 节点配置

### 1. User Input 节点
接收用户输入的文本。

**配置参数：**
| 参数 | 说明 | 默认值 |
|-----|------|-------|
| variable_name | 变量名称，用于后续节点引用 | user_input |
| placeholder | 输入框占位提示文本 | Please enter text... |

**使用示例：**
```
variable_name: user_query
placeholder: 请输入您的问题...
```

### 2. LLM 节点
调用大语言模型进行文本生成。

**配置参数：**
| 参数 | 说明 | 默认值 |
|-----|------|-------|
| model | 模型名称 | gpt-3.5-turbo |
| api_base | API 基础地址 | (从环境变量读取) |
| api_key | API 密钥 | (从环境变量读取) |
| system_prompt | 系统提示词 | 空 |
| prompt_template | 提示词模板 | {{user_input}} |
| temperature | 温度参数 (0-2) | 0.7 |
| max_tokens | 最大生成令牌数 | 2048 |
| top_p | 核采样参数 | 1.0 |

**提示词模板变量：**
使用 `{{variable_name}}` 语法引用上游节点的输出。

**使用示例：**
```
system_prompt: 你是一个专业的翻译助手。
prompt_template: 请将以下内容翻译成英文：{{user_input}}
temperature: 0.3
```

### 3. TTS 节点
将文本转换为语音。

**配置参数：**
| 参数 | 说明 | 默认值 |
|-----|------|-------|
| voice | 语音角色 | zh-CN-XiaoxiaoNeural |
| speed | 语速调整 | +0% |
| pitch | 音调调整 | +0Hz |
| output_format | 输出格式 | mp3 |

**支持的语音角色：**
- `zh-CN-XiaoxiaoNeural` - 晓晓（女声）
- `zh-CN-YunxiNeural` - 云希（男声）
- `zh-CN-YunjianNeural` - 云健（男声）
- `en-US-JennyNeural` - Jenny（英语女声）

**使用示例：**
```
voice: zh-CN-YunxiNeural
speed: +10%
pitch: +0Hz
```

### 4. End 节点
工作流的结束节点，输出最终结果。

**配置参数：**
| 参数 | 说明 | 默认值 |
|-----|------|-------|
| output_type | 输出类型 | auto |

**输出类型：**
- `auto` - 自动检测
- `text` - 文本输出
- `audio` - 音频输出

---

## 故障排查

### 后端启动失败

**问题**：`ModuleNotFoundError: No module named 'fastapi'`
**解决**：
```bash
cd backend
pip install -r requirements.txt
```

**问题**：`Error: OPENAI_API_KEY not set`
**解决**：
创建 `.env` 文件并配置 API 密钥：
```env
OPENAI_API_KEY=your_api_key_here
```

### 前端启动失败

**问题**：`npm install` 卡住或失败
**解决**：
```bash
# 清除缓存后重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**问题**：端口被占用
**解决**：
```bash
# 使用其他端口
npm run dev -- --port 3000
```

### 工作流执行失败

**问题**：LLM 节点返回错误
**检查项**：
1. 检查 `.env` 中的 `OPENAI_API_KEY` 是否正确
2. 检查网络连接
3. 查看后端日志获取详细错误信息

**问题**：TTS 节点无法生成音频
**检查项**：
1. 检查网络连接（Edge TTS 需要联网）
2. 检查磁盘空间
3. 查看 `backend/data/audio/` 目录权限

### 常见问题

**Q: 如何查看执行日志？**
A: 点击「执行」按钮后，右侧面板会显示执行日志和进度。

**Q: 如何保存工作流？**
A: 点击工具栏的「保存」按钮，工作流会自动保存到后端存储。

**Q: 支持哪些 LLM 模型？**
A: 默认支持 OpenAI 的 GPT 系列模型。可通过配置 `api_base` 支持其他兼容 OpenAI API 的模型。

**Q: 如何导出/导入工作流？**
A: 目前版本工作流以 JSON 格式存储在 `backend/data/workflows/` 目录，可直接复制文件进行备份。

---

## 获取帮助

如有问题，请：
1. 查看后端控制台日志
2. 查看浏览器开发者工具 Console
3. 检查网络请求状态（Network 面板）

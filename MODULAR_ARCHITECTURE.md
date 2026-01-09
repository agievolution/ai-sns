# API Server 模块化架构文档

## 概述

本文档描述了将原始的 `api_server.py` (1153行) 重构为模块化架构的过程。新架构将31个API端点按功能分类到6个独立的业务模块中。

## 架构对比

### 原架构 (api_server.py)
- 单文件: 1153 行代码
- 31个API端点混合在一起
- 难以维护和扩展

### 新架构 (api_server_modular.py + backend/modules/)
- 模块化结构
- 6个独立业务模块
- 清晰的职责分离
- 易于维护和测试

## 模块结构

```
backend/
├── __init__.py
└── modules/
    ├── __init__.py
    ├── agent/              # Agent管理模块 (4个端点)
    │   ├── __init__.py
    │   ├── router.py       # API路由定义
    │   ├── schemas.py      # Pydantic数据模型
    │   ├── service.py      # 业务逻辑层
    │   └── dependencies.py # 依赖注入
    │
    ├── chat/               # 聊天模块 (6个端点)
    │   ├── __init__.py
    │   ├── router.py
    │   ├── schemas.py
    │   ├── service.py
    │   ├── streaming.py    # SSE流式响应处理
    │   └── dependencies.py
    │
    ├── map/                # 地图模块 (13个端点)
    │   ├── __init__.py
    │   ├── router.py
    │   ├── schemas.py
    │   ├── service.py
    │   ├── websocket.py    # WebSocket处理
    │   └── dependencies.py
    │
    ├── km/                 # 知识管理模块 (5个端点)
    │   ├── __init__.py
    │   ├── router.py
    │   ├── schemas.py
    │   ├── service.py
    │   └── dependencies.py
    │
    ├── system/             # 系统配置模块 (2个端点)
    │   ├── __init__.py
    │   ├── router.py
    │   ├── schemas.py
    │   ├── service.py
    │   └── dependencies.py
    │
    └── plugins/            # 插件管理模块 (2个端点)
        ├── __init__.py
        ├── router.py
        ├── schemas.py
        ├── service.py
        └── dependencies.py
```

## 模块详细说明

### 1. Agent模块 (4个端点)

管理AI Agent的配置和生命周期。

**端点:**
- `GET /api/agents` - 获取所有Agent配置
- `POST /api/agents` - 创建新Agent
- `PUT /api/agents/{agent_id}` - 更新Agent配置
- `DELETE /api/agents/{agent_id}` - 删除Agent

**文件:**
- `router.py`: FastAPI路由定义
- `schemas.py`: AgentConfig, AgentResponse模型
- `service.py`: AgentService业务逻辑
- `dependencies.py`: 依赖注入函数

### 2. Chat模块 (6个端点)

处理AI聊天对话和流式响应。

**端点:**
- `GET /api/ai-chat/configs` - 获取AI聊天配置
- `POST /api/ai-chat/configs` - 创建AI聊天配置
- `POST /api/chat` - 发送聊天消息
- `GET /api/chat/history/{agent_id}` - 获取聊天历史
- `GET /api/chat/stream` - 流式聊天端点信息
- `POST /api/chat/stream` - 流式聊天 (SSE)
- `GET /api/config/status` - 检查AI配置状态

**文件:**
- `router.py`: API路由
- `schemas.py`: ChatMessage, ChatRequest, StreamChatRequest, AiChatConfig
- `service.py`: ChatService - 配置管理和聊天逻辑
- `streaming.py`: StreamingService - SSE流式响应处理
- `dependencies.py`: 依赖注入

**特性:**
- 支持SSE (Server-Sent Events) 流式响应
- 多优先级配置加载 (数据库 > 环境变量 > 配置文件)
- 聊天历史管理

### 3. Map模块 (13个端点)

基于位置的功能,包括地图配置、路线规划、标记管理和WebSocket通信。

**端点:**
- `GET /api/map/settings` - 获取地图配置
- `PUT /api/map/settings` - 更新地图配置
- `GET /api/map/settings/home` - 获取住址配置
- `PUT /api/map/settings/home` - 更新住址配置
- `POST /api/map/route` - 规划路线
- `POST /api/map/route/{route_id}/control` - 控制路线模拟
- `GET /api/map/markers` - 获取地图标记
- `POST /api/map/markers` - 添加地图标记
- `PUT /api/map/markers/{marker_id}` - 更新地图标记
- `DELETE /api/map/markers/{marker_id}` - 删除地图标记
- `POST /api/map/chat` - 发送地图聊天消息
- `GET /api/map/chat/history` - 获取地图聊天历史
- `WS /api/map/ws/{client_id}` - WebSocket连接

**文件:**
- `router.py`: API路由和WebSocket端点
- `schemas.py`: MapConfig, MapMarker, RouteRequest, ChatMessageMap
- `service.py`: MapService - 地图业务逻辑
- `websocket.py`: ConnectionManager - WebSocket连接管理
- `dependencies.py`: 依赖注入

**特性:**
- 支持百度地图和Google地图
- 实时WebSocket通信
- 路线规划和模拟
- 地图标记管理

### 4. KM模块 (知识管理) (5个端点)

管理知识库和文件上传。

**端点:**
- `GET /api/knowledge-base` - 获取所有知识库
- `POST /api/knowledge-base` - 创建知识库
- `PUT /api/knowledge-base/{kb_id}` - 更新知识库
- `DELETE /api/knowledge-base/{kb_id}` - 删除知识库
- `POST /api/knowledge-base/{kb_id}/upload` - 上传文件到知识库

**文件:**
- `router.py`: API路由
- `schemas.py`: KMConfig, KMResponse
- `service.py`: KMService - 知识库管理
- `dependencies.py`: 依赖注入

### 5. System模块 (2个端点)

系统配置管理。

**端点:**
- `GET /api/system/config` - 获取系统配置
- `PUT /api/system/config` - 更新系统配置

**文件:**
- `router.py`: API路由
- `schemas.py`: SystemConfig
- `service.py`: SystemService
- `dependencies.py`: 依赖注入

**配置项:**
- theme: 主题 (dark/light)
- language: 语言 (zh/en)
- minirunontray: 最小化到托盘

### 6. Plugins模块 (2个端点)

插件系统管理。

**端点:**
- `GET /api/plugins` - 获取所有插件
- `GET /api/plugins/{plugin_name}` - 获取插件信息

**文件:**
- `router.py`: API路由
- `schemas.py`: PluginInfo
- `service.py`: PluginService
- `dependencies.py`: 依赖注入

## 使用方式

### 启动新的模块化服务器

```bash
python api_server_modular.py --host 0.0.0.0 --port 8788 --reload
```

### 启动原服务器 (保持兼容)

```bash
python api_server.py --host 0.0.0.0 --port 8788 --reload
```

## 设计模式

### 1. 分层架构
每个模块采用三层架构:
- **Router层**: 处理HTTP请求和响应
- **Service层**: 实现业务逻辑
- **Data层**: 数据库访问 (通过db.DBFactory)

### 2. 依赖注入
使用FastAPI的Depends进行依赖注入:
```python
@router.get("/api/agents")
async def get_agents(service: AgentService = Depends(get_agent_service)):
    ...
```

### 3. Pydantic模型
所有数据模型使用Pydantic进行验证:
```python
class AgentConfig(BaseModel):
    name: str
    model: Optional[str] = "gpt-4"
    ...
```

## API端点统计

| 模块 | 端点数量 | 说明 |
|------|---------|------|
| Agent | 4 | Agent管理 |
| Chat | 6 | 聊天和配置 |
| Map | 13 | 地图和WebSocket |
| KM | 5 | 知识管理 |
| System | 2 | 系统配置 |
| Plugins | 2 | 插件管理 |
| **总计** | **32** | - |

## 优势

### 1. 可维护性
- 代码按功能分离
- 单一职责原则
- 易于定位和修复问题

### 2. 可扩展性
- 新功能可作为独立模块添加
- 不影响现有模块
- 支持模块级别的测试

### 3. 可读性
- 清晰的目录结构
- 标准化的文件命名
- 详细的文档注释

### 4. 可测试性
- 每个模块可独立测试
- Service层可以mock
- 依赖注入便于单元测试

## 迁移指南

### 从原api_server.py迁移到模块化架构

1. **API端点兼容性**: 所有原有端点路径保持不变
2. **配置兼容性**: 使用相同的数据库和配置文件
3. **逐步迁移**: 可以同时运行两个版本进行平滑过渡

### 添加新模块

1. 在`backend/modules/`下创建新模块目录
2. 创建必需文件: `__init__.py`, `router.py`, `schemas.py`, `service.py`, `dependencies.py`
3. 在`api_server_modular.py`中注册路由:
```python
from backend.modules.new_module.router import router as new_module_router
app.include_router(new_module_router)
```

## 测试

### 测试单个模块
```python
# 测试Agent模块
from backend.modules.agent.service import AgentService

service = AgentService()
agents = service.get_all_agents()
```

### API测试
访问FastAPI自动生成的文档:
- Swagger UI: http://localhost:8788/docs
- ReDoc: http://localhost:8788/redoc

## 性能考虑

- **延迟导入**: Agent模块在首次使用时才导入,加快启动速度
- **连接池**: 复用数据库连接
- **异步处理**: 使用async/await处理IO操作

## 未来改进

1. **添加中间件**: 认证、限流、日志
2. **API版本控制**: 支持v1, v2等版本
3. **完善测试**: 添加单元测试和集成测试
4. **监控**: 添加性能监控和健康检查
5. **文档**: 使用OpenAPI生成客户端SDK

## 作者

Created by: Claude Code
Date: 2026-01-10

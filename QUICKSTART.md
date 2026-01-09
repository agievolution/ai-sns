# API Server 模块化架构 - 快速开始

## 概述

已成功将 `api_server.py` (1153行) 重构为模块化架构，创建了6个独立的业务模块。

## 创建的文件

### 主文件
- **api_server_modular.py** (139行) - 新的模块化API服务器入口
- **MODULAR_ARCHITECTURE.md** - 完整架构文档
- **API_ENDPOINT_MAPPING.md** - 端点映射表

### 模块文件 (33个文件)
```
backend/modules/
├── agent/      (5个文件) - Agent管理模块
├── chat/       (6个文件) - 聊天和流式响应模块
├── map/        (6个文件) - 地图和WebSocket模块
├── km/         (5个文件) - 知识管理模块
├── system/     (5个文件) - 系统配置模块
└── plugins/    (5个文件) - 插件管理模块
```

**总计**: 33个Python文件，约1940行代码

## 快速启动

### 1. 启动新的模块化服务器

```bash
cd /mnt/c/dev/agi-ev/ai-sns-el
python api_server_modular.py --host 0.0.0.0 --port 8788 --reload
```

### 2. 测试API端点

```bash
# 健康检查
curl http://localhost:8788/health

# 查看所有端点
curl http://localhost:8788/

# Agent管理
curl http://localhost:8788/api/agents

# AI聊天配置
curl http://localhost:8788/api/ai-chat/configs

# 地图设置
curl http://localhost:8788/api/map/settings

# 知识库
curl http://localhost:8788/api/knowledge-base

# 系统配置
curl http://localhost:8788/api/system/config

# 插件列表
curl http://localhost:8788/api/plugins
```

### 3. 查看API文档

浏览器访问：
- **Swagger UI**: http://localhost:8788/docs
- **ReDoc**: http://localhost:8788/redoc
- **OpenAPI JSON**: http://localhost:8788/openapi.json

## 模块概览

### Agent模块 (4个端点)
- `GET /api/agents` - 获取所有Agent
- `POST /api/agents` - 创建新Agent
- `PUT /api/agents/{agent_id}` - 更新Agent
- `DELETE /api/agents/{agent_id}` - 删除Agent

### Chat模块 (7个端点)
- `GET /api/ai-chat/configs` - 获取AI配置
- `POST /api/ai-chat/configs` - 创建AI配置
- `POST /api/chat` - 发送聊天消息
- `GET /api/chat/history/{agent_id}` - 获取聊天历史
- `GET /api/chat/stream` - 流式聊天端点信息
- `POST /api/chat/stream` - 流式聊天 (SSE)
- `GET /api/config/status` - 检查配置状态

### Map模块 (13个端点)
- `GET /api/map/settings` - 获取地图配置
- `PUT /api/map/settings` - 更新地图配置
- `GET /api/map/settings/home` - 获取住址
- `PUT /api/map/settings/home` - 更新住址
- `POST /api/map/route` - 规划路线
- `POST /api/map/route/{route_id}/control` - 控制路线
- `GET /api/map/markers` - 获取标记
- `POST /api/map/markers` - 添加标记
- `PUT /api/map/markers/{marker_id}` - 更新标记
- `DELETE /api/map/markers/{marker_id}` - 删除标记
- `POST /api/map/chat` - 发送地图聊天
- `GET /api/map/chat/history` - 获取聊天历史
- `WS /api/map/ws/{client_id}` - WebSocket连接

### KM模块 (5个端点)
- `GET /api/knowledge-base` - 获取所有知识库
- `POST /api/knowledge-base` - 创建知识库
- `PUT /api/knowledge-base/{kb_id}` - 更新知识库
- `DELETE /api/knowledge-base/{kb_id}` - 删除知识库
- `POST /api/knowledge-base/{kb_id}/upload` - 上传文件

### System模块 (2个端点)
- `GET /api/system/config` - 获取系统配置
- `PUT /api/system/config` - 更新系统配置

### Plugins模块 (2个端点)
- `GET /api/plugins` - 获取所有插件
- `GET /api/plugins/{plugin_name}` - 获取插件信息

## 模块结构

每个模块采用标准的四层结构：

```
module_name/
├── __init__.py         - 模块初始化
├── router.py           - API路由定义 (FastAPI)
├── schemas.py          - Pydantic数据模型
├── service.py          - 业务逻辑层
└── dependencies.py     - 依赖注入
```

特殊模块：
- **Chat**: 额外的 `streaming.py` 处理SSE流式响应
- **Map**: 额外的 `websocket.py` 处理WebSocket连接

## 架构优势

1. **清晰的职责分离**: 每个模块独立负责一个功能域
2. **易于维护**: 代码按功能分类，容易定位和修复问题
3. **可扩展**: 添加新功能只需创建新模块
4. **可测试**: 每个模块可以独立测试
5. **团队协作**: 多人可以同时开发不同模块

## 兼容性

- ✅ **API端点路径保持不变** - 所有原有端点路径完全兼容
- ✅ **数据库配置兼容** - 使用相同的 `db.DBFactory`
- ✅ **配置文件兼容** - 使用相同的 `ai_config.yaml`
- ✅ **可以同时运行** - 新旧服务器可以共存用于测试

## 下一步

### 开发
1. 查看 `MODULAR_ARCHITECTURE.md` 了解详细架构
2. 查看 `API_ENDPOINT_MAPPING.md` 了解端点映射
3. 在各个模块中添加新功能

### 测试
1. 编写单元测试 (pytest)
2. 编写集成测试
3. 添加API测试用例

### 部署
1. 使用 Docker 容器化
2. 配置 Nginx 反向代理
3. 设置监控和日志

## 文件路径

所有新创建的文件路径：

```
/mnt/c/dev/agi-ev/ai-sns-el/
├── api_server_modular.py                    # 新的API服务器入口
├── MODULAR_ARCHITECTURE.md                  # 架构文档
├── API_ENDPOINT_MAPPING.md                  # 端点映射表
├── QUICKSTART.md                            # 本文件
└── backend/
    └── modules/
        ├── agent/
        │   ├── __init__.py
        │   ├── router.py
        │   ├── schemas.py
        │   ├── service.py
        │   └── dependencies.py
        ├── chat/
        │   ├── __init__.py
        │   ├── router.py
        │   ├── schemas.py
        │   ├── service.py
        │   ├── streaming.py
        │   └── dependencies.py
        ├── map/
        │   ├── __init__.py
        │   ├── router.py
        │   ├── schemas.py
        │   ├── service.py
        │   ├── websocket.py
        │   └── dependencies.py
        ├── km/
        │   ├── __init__.py
        │   ├── router.py
        │   ├── schemas.py
        │   ├── service.py
        │   └── dependencies.py
        ├── system/
        │   ├── __init__.py
        │   ├── router.py
        │   ├── schemas.py
        │   ├── service.py
        │   └── dependencies.py
        └── plugins/
            ├── __init__.py
            ├── router.py
            ├── schemas.py
            ├── service.py
            └── dependencies.py
```

## 问题排查

### 导入错误
如果遇到导入错误，确保：
1. 在项目根目录运行
2. Python路径包含项目根目录
3. 所有 `__init__.py` 文件存在

### 端口冲突
如果8788端口被占用：
```bash
python api_server_modular.py --port 8789
```

### 数据库连接
确保 `db.DBFactory` 配置正确，数据库文件存在。

## 贡献指南

### 添加新模块
1. 在 `backend/modules/` 下创建新目录
2. 创建标准的5个文件
3. 在 `api_server_modular.py` 中注册路由
4. 更新文档

### 修改现有模块
1. 只修改相关模块的文件
2. 保持API接口兼容性
3. 添加测试用例
4. 更新文档

## 联系方式

Created by: Claude Code
Date: 2026-01-10
Version: 2.0.0

## 参考文档

- [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md) - 完整架构说明
- [API_ENDPOINT_MAPPING.md](./API_ENDPOINT_MAPPING.md) - 端点映射详情
- [FastAPI文档](https://fastapi.tiangolo.com/)
- [Pydantic文档](https://pydantic-docs.helpmanual.io/)

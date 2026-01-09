# 启动问题修复

## 问题

错误信息显示系统在使用 Python 2.7，但此项目需要 Python 3.7+

## 解决方案

### 1. 检查虚拟环境的 Python 版本

```powershell
# 在虚拟环境中
python --version
```

如果显示 Python 2.7，需要重新创建虚拟环境。

### 2. 重新创建虚拟环境（使用 Python 3）

```powershell
# 退出当前虚拟环境
deactivate

# 删除旧的虚拟环境
Remove-Item -Recurse -Force venv

# 使用 Python 3 创建新的虚拟环境
python3 -m venv venv
# 或者
py -3 -m venv venv

# 激活新的虚拟环境
.\venv\Scripts\Activate.ps1

# 验证 Python 版本
python --version  # 应该显示 Python 3.x

# 安装依赖
pip install -r requirements.txt
```

### 3. 启动新的 API 服务器

```powershell
python api_server_new.py
```

## 已修复的问题

✅ 修复了 `backend/modules/map/router.py` 中 ConnectionManager 未导入的问题
✅ 修复了所有模块 router 的 prefix 重复问题
✅ 修复了 `backend/__init__.py` 和 `backend/modules/__init__.py` 的循环导入问题
✅ 在 `backend/config/settings.py` 中添加了 `get_settings()` 函数
✅ 修复了 `api_server_new.py` 中的 `allowed_origins` → `cors_origins` 属性名

## 验证启动成功

启动成功后应该看到：

```
============================================================
AI-SNS API Server (Modular) Starting...
Version: 2.0.0
Environment: development
============================================================
DBPath C:\dev\agi-ev\ai-sns-el\db\db.sqlite
✓ Database initialized
✓ All modules loaded:
  - Agent Module
  - Chat Module (with SSE streaming)
  - Map Module (with WebSocket)
  - Knowledge Base Module
  - System Module
  - Plugins Module
============================================================
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8788 (Press CTRL+C to quit)
```

然后访问 http://localhost:8788/docs 查看 API 文档。

## 如果仍有问题

检查是否安装了所有依赖：

```powershell
pip install fastapi uvicorn sqlalchemy pydantic pyyaml httpx sse-starlette python-multipart
```

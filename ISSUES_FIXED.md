# API Server 启动问题已修复

## 🔧 已修复的所有问题

### 1. ConnectionManager 未定义错误
**问题**：`backend/modules/map/router.py:247` 处 ConnectionManager 类型未导入
**修复**：添加导入语句 `from backend.shared.websocket_manager import ConnectionManager`

### 2. Router Prefix 重复
**问题**：所有模块的 router 都设置了 prefix，但在 `api_server_new.py` 中又设置了一次
**修复**：移除所有模块 router 中的 prefix 参数，只在主服务器中设置

已修复的文件：
- `backend/modules/agent/router.py`
- `backend/modules/chat/router.py`
- `backend/modules/map/router.py`
- `backend/modules/km/router.py`
- `backend/modules/plugins/router.py`
- `backend/modules/system/router.py`

### 3. 循环导入问题
**问题**：`backend/__init__.py` 和 `backend/modules/__init__.py` 在模块导入时就执行所有子模块导入
**修复**：移除预先导入，改为按需导入

### 4. Settings 函数缺失
**问题**：`api_server_new.py` 调用 `get_settings()`，但 settings.py 只有单例实例
**修复**：添加 `get_settings()` 函数返回单例实例

### 5. CORS 配置属性名错误
**问题**：`api_server_new.py` 使用 `settings.server.allowed_origins`，但实际属性名是 `cors_origins`
**修复**：更正为 `settings.server.cors_origins`

### 6. Config __init__.py 导入错误
**问题**：`backend/config/__init__.py` 导入不存在的 `settings` 实例
**修复**：改为导入 `get_settings` 函数

---

## 🚀 现在启动服务器

### 方法1：直接启动（推荐）

```powershell
# 确保在项目根目录
cd C:\dev\agi-ev\ai-sns-el

# 激活虚拟环境（如果还没激活）
.\venv\Scripts\Activate.ps1

# 检查 Python 版本（应该是 3.7+）
python --version

# 启动新的模块化 API 服务器
python api_server_new.py
```

### 方法2：使用 uvicorn

```powershell
uvicorn api_server_new:app --reload --host 0.0.0.0 --port 8788
```

---

## ✅ 启动成功标志

看到以下输出表示启动成功：

```
============================================================
AI-SNS API Server (Modular) Starting...
Version: 2.0.0
Environment: development
============================================================
DBPath C:\dev\agi-ev\ai-sns-el\db\db.sqlite
INFO:     Will watch for changes in these directories: ['C:\\dev\\agi-ev\\ai-sns-el']
INFO:     Uvicorn running on http://0.0.0.0:8788 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
✓ Database initialized
✓ All modules loaded:
  - Agent Module
  - Chat Module (with SSE streaming)
  - Map Module (with WebSocket)
  - Knowledge Base Module
  - System Module
  - Plugins Module
============================================================
INFO:     Application startup complete.
```

---

## 🧪 验证 API 工作正常

### 1. 访问 API 文档
打开浏览器访问：http://localhost:8788/docs

应该看到完整的 Swagger API 文档界面。

### 2. 测试健康检查端点

```powershell
curl http://localhost:8788/api/health
```

预期响应：
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "architecture": "modular"
}
```

### 3. 测试根端点

```powershell
curl http://localhost:8788/
```

预期响应：
```json
{
  "name": "AI-SNS API",
  "version": "2.0.0",
  "architecture": "modular",
  "docs": "/docs",
  "modules": [
    "agent",
    "chat",
    "map",
    "km",
    "system",
    "plugins"
  ]
}
```

---

## ⚠️ 如果仍然遇到问题

### 问题1：Python 版本错误

如果看到 `SyntaxError: invalid syntax`，说明 Python 版本太低。

**解决方案**：
```powershell
# 检查虚拟环境中的 Python 版本
python --version

# 如果是 Python 2.x，重新创建虚拟环境
deactivate
Remove-Item -Recurse -Force venv
py -3 -m venv venv  # 或 python3 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 问题2：缺少依赖

如果看到 `ModuleNotFoundError`，安装缺失的依赖。

**解决方案**：
```powershell
pip install fastapi uvicorn sqlalchemy pydantic pyyaml httpx sse-starlette python-multipart
```

### 问题3：数据库连接错误

如果看到数据库相关错误，确保数据库文件存在。

**解决方案**：
```powershell
# 创建数据库目录
mkdir -Force db

# 如果需要，可以从旧系统复制数据库
# 或者让应用自动创建新数据库
```

### 问题4：端口被占用

如果看到 `Address already in use`，更改端口。

**解决方案**：
```powershell
# 方法1：杀掉占用端口的进程
netstat -ano | findstr :8788
taskkill /PID <进程ID> /F

# 方法2：使用不同端口
uvicorn api_server_new:app --port 8789
```

---

## 📝 后续步骤

1. **启动前端应用**
   ```powershell
   npm start
   ```

2. **测试所有功能**
   - 访问每个模块的页面
   - 测试 API 端点
   - 验证 WebSocket 连接

3. **查看详细文档**
   - `REFACTORING_COMPLETE.md` - 完整重构报告
   - `QUICK_START.md` - 快速启动指南

---

## 🎉 祝贺

所有问题已修复！新的模块化 API 服务器现在应该可以正常启动了。

如果遇到任何其他问题，请检查终端输出的错误信息。

# Agent Module

AI聊天代理模块，提供流式AI对话功能。

## 模块结构

```
agent/
├── index.js              # 模块入口，导出标准接口
├── AgentPage.js          # 主内容区渲染（聊天界面）
├── AgentSidebar.js       # 侧边栏渲染（Agent列表、聊天历史）
├── agentHandlers.js      # 事件处理（消息发送、流式响应）
├── agentState.js         # 状态管理（聊天历史、流式状态）
└── agentApi.js           # API调用封装（与后端通信）
```

## 主要功能

### 1. 流式AI对话
- 支持实时流式响应
- Markdown格式输出
- 代码高亮显示
- 复制代码功能

### 2. 多模型支持
- GPT-4 / GPT-3.5
- Claude 3
- DeepSeek
- 其他LLM模型

### 3. 角色切换
- 资深程序员
- 通用助手
- 创意写作
- 数据分析师

### 4. 聊天管理
- 新建对话
- 聊天历史
- 收藏对话
- 搜索功能

## 使用方式

### 导入模块
```javascript
import agentModule from './modules/agent/index.js';

// 初始化
agentModule.init();

// 渲染页面
const pageHTML = agentModule.renderPage();
const sidebarHTML = agentModule.renderSidebar();
```

### 状态管理
```javascript
import agentState from './modules/agent/agentState.js';

// 获取聊天历史
const history = agentState.getChatHistory();

// 添加消息
agentState.addMessage('user', '你好');

// 重置状态
agentState.reset();
```

### API调用
```javascript
import agentApi from './modules/agent/agentApi.js';

// 获取Agent列表
const agents = await agentApi.getAgents();

// 发送流式消息
await agentApi.sendMessageStream(messages, requestId);

// 获取聊天历史
const chats = await agentApi.getChatHistory();
```

## 接口说明

### 模块标准接口
- `renderPage()` - 渲染主内容区
- `renderSidebar()` - 渲染侧边栏
- `init()` - 初始化模块
- `destroy()` - 销毁模块

### 流式响应事件
- `onChatStreamData` - 接收流式数据
- `onChatStreamEnd` - 流式响应结束
- `onChatStreamError` - 流式响应错误

## 依赖组件

- Modal - 模态对话框
- Notification - 通知提示
- electronAPI - Electron IPC通信

## 注意事项

1. 需要在 Electron 环境中使用流式聊天功能
2. Markdown 渲染支持代码块、列表、链接等
3. 代码高亮使用简化版实现，支持常见语言
4. 聊天历史存储在内存中，刷新页面会丢失
5. 流式响应有2分钟超时限制

## 开发模式

如果没有 `electronAPI`，模块会自动使用模拟响应进行开发测试。

## 文件说明

### index.js
模块入口文件，提供标准接口供外部调用。

### AgentPage.js
渲染主聊天界面，包括：
- 顶部工具栏（模型选择、角色选择）
- 消息显示区（欢迎消息、用户消息、AI回复）
- 输入区（文本输入、工具栏按钮）

### AgentSidebar.js
渲染侧边栏，包括：
- 用户信息头部
- 新建对话/设置按钮
- 搜索框
- 聊天列表/标签列表切换
- Agent列表

### agentHandlers.js
核心事件处理逻辑，包括：
- 消息发送处理
- 流式响应处理
- Markdown渲染
- 代码高亮
- 事件绑定

### agentState.js
状态管理，维护：
- 聊天历史记录
- 当前请求ID
- 流式内容缓存
- 模型和角色选择
- Agent和聊天列表

### agentApi.js
API调用封装，提供：
- Agent管理接口
- 聊天历史接口
- 流式消息发送
- 聊天操作（删除、收藏等）

## 更新日志

### v1.0.0 (2026-01-10)
- 初始版本
- 支持流式AI对话
- Markdown渲染和代码高亮
- 多模型和角色切换
- 聊天历史管理

# SNS Module

SNS（Social Network Service）模块 - 地图社交网络模块

## 文件结构

```
renderer/js/modules/sns/
├── index.js           # 模块入口（41行）
├── SNSPage.js         # 主内容渲染（372行）
├── SNSSidebar.js      # 侧边栏渲染（60行）
├── snsHandlers.js     # 事件处理（457行）
├── snsState.js        # 状态管理（134行）
└── snsApi.js          # API调用封装（260行）
```

**总计：1,324行代码**

## 模块说明

### 1. index.js - 模块入口
标准模块接口，导出以下方法：
- `name`: 模块名称 'sns'
- `version`: 版本号 '1.0.0'
- `renderPage()`: 渲染主内容区
- `renderSidebar()`: 渲染侧边栏
- `init()`: 初始化模块
- `destroy()`: 销毁模块

### 2. SNSPage.js - 主内容渲染
包含复杂的地图UI布局：
- **顶部工具栏**：在线状态、品牌、刷新/全屏/搜索按钮、工具栏收缩
- **地图容器**：iframe加载地图页面（localhost:8788/scripts/map.html）
- **右侧设置面板**：地图设置、系统设置、移动模式选择
- **底部动作栏**：广场/社区/AI切换、Start按钮、导航/气象/图层
- **地图控制**：放大/缩小/定位/指南针
- **右侧状态面板**：
  - Process页签：当前状态（金钱、生命、能量、位置等）
  - Resource页签：资源概览（CPU、内存、磁盘、网络）
  - Think页签：AI模型状态、思考日志

### 3. SNSSidebar.js - 侧边栏渲染
简洁的侧边栏内容：
- 顶部标题："Explore the Earth-Y宝"
- 用户属性面板：等级、信用、金钱、生命值、能量、经验值
- Chat/Trade标签切换
- 联系人列表
- 底部用户信息（在线状态）

### 4. snsHandlers.js - 事件处理
核心业务逻辑处理（457行）：

#### 初始化方法
- `init()`: 初始化SNS页面，调用各子初始化方法
- `destroy()`: 清理事件监听器

#### 工具栏/面板管理
- `initSNSToolbar()`: 顶部工具栏收缩/展开
- `initSNSSettingsPanel()`: 右侧设置面板收缩/展开
- `initSNSPanelResizer()`: 状态面板拖拽调整宽度
- `initSNSActionBar()`: 底部动作栏按钮事件
- `initSNSStatusTabs()`: 状态页签切换

#### 地图功能
- `loadBaiduMap()`: 加载百度地图iframe
- `tryLoadMap()`: 重试加载地图
- `showMapError()`: 显示地图错误信息
- `handleLocationUpdate()`: 处理位置更新
- `handleMapClick()`: 处理地图点击
- `handleMarkerAdd()`: 处理添加标记
- `sendMessageToMap()`: 向地图iframe发送消息
- `cleanupMapListeners()`: 清理地图监听器

#### 数据加载
- `loadSNSData()`: 加载SNS统计数据（在线节点、活跃用户、消息数）

### 5. snsState.js - 状态管理
集中管理SNS模块状态（134行）：

#### 状态结构
```javascript
{
  map: {
    initialized: false,
    center: { lng, lat },
    zoom: 12,
    markers: []
  },
  user: {
    money, life, energy, profession,
    level, credit, exp,
    location: { lng, lat }
  },
  online: {
    status: 'online',
    nodes, activeUsers, messageCount
  },
  moveMode: 'free', // 'route', 'free', 'follow'
  panels: {
    toolbar: { collapsed },
    settings: { collapsed },
    status: { collapsed, activeTab }
  },
  websocket: {
    connected, reconnecting
  }
}
```

#### 状态管理方法
- `getState()`: 获取完整状态
- `updateMap()`: 更新地图状态
- `updateUser()`: 更新用户状态
- `updateOnline()`: 更新在线状态
- `setMoveMode()`: 设置移动模式
- `updatePanel()`: 更新面板状态
- `addMarker()` / `removeMarker()` / `clearMarkers()`: 标记管理
- `updateWebSocket()`: 更新WebSocket状态

### 6. snsApi.js - API调用封装
封装SNS相关API（260行，当前为TODO骨架）：

#### 用户相关
- `getUserInfo(userId)`: 获取用户信息
- `updateLocation(location)`: 更新用户位置
- `getNearbyUsers(location, radius)`: 获取附近用户

#### 消息相关
- `sendMessage(targetId, message)`: 发送消息
- `getMessageHistory(targetId, limit)`: 获取消息历史
- `connectWebSocket(userId, onMessage, onError)`: 建立WebSocket连接

#### 节点相关
- `getNodes()`: 获取SNS节点列表
- `getOnlineStats()`: 获取在线统计

#### 地图相关
- `getMapPOI(bounds)`: 获取地图POI数据

#### 任务相关
- `getTasks()`: 获取任务列表
- `acceptTask(taskId)`: 接受任务
- `completeTask(taskId)`: 完成任务

## 关键特性

### 1. 地图集成
- 使用iframe嵌入地图页面（localhost:8788/scripts/map.html）
- PostMessage API实现双向通信
- 支持位置更新、地图点击、标记添加等事件

### 2. 面板管理
- 支持工具栏收缩/展开（localStorage持久化）
- 支持设置面板收缩/展开（localStorage持久化）
- 支持状态面板拖拽调整宽度（200-500px）
- 支持状态面板折叠（localStorage持久化）

### 3. 实时通信
- WebSocket支持（待实现）
- 位置实时更新
- 在线状态同步

### 4. 多页签状态面板
- Process：当前状态、进行中任务、历史记录
- Resource：资源概览、系统信息、网络统计
- Think：AI模型状态、思考日志、决策队列

### 5. 移动模式
- 指定路线（route）
- 自由移动（free）
- 跟随模式（follow）

## 使用方式

```javascript
// 在 app.js 中导入
import snsModule from './modules/sns/index.js';

// 注册模块
App.registerModule('sns', snsModule);

// 切换到SNS页面
App.navigateTo('sns');
```

## 依赖

- 地图服务：需要运行在 `http://localhost:8788/scripts/map.html`
- localStorage：用于持久化面板状态
- PostMessage API：用于iframe通信

## 待完善功能

1. **snsApi.js**: 所有API方法都是TODO骨架，需要实现实际的HTTP请求
2. **WebSocket**: 需要实现完整的WebSocket连接和消息处理
3. **地图交互**: 需要与地图页面建立更丰富的交互协议
4. **任务系统**: 需要实现完整的任务流程（接受、执行、完成）
5. **社交功能**: 需要实现聊天、交易等社交功能

## 与原代码对比

原`pages.js`中SNS相关代码（约从第146行到第1831行）：
- `renderSNSPage()`: 已提取到 SNSPage.js
- `renderSNSSidebar()`: 已提取到 SNSSidebar.js
- `initSNSPage()`: 已提取并拆分到 snsHandlers.js 的多个方法
- 所有地图相关方法：已提取到 snsHandlers.js
- 状态数据分散在代码中：已统一到 snsState.js
- API调用逻辑：已封装到 snsApi.js（骨架）

## 模块复杂度

SNS是**最复杂的模块**（1,324行），包含：
- 复杂的UI布局（工具栏、设置面板、状态面板）
- iframe地图集成和PostMessage通信
- 多种面板收缩/展开/拖拽交互
- 实时位置更新和WebSocket通信（待实现）
- 完整的状态管理体系
- 丰富的API接口封装

相比之下，home模块只有约200行代码。

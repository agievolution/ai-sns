# SNS Profile 功能架构图

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron 主窗口                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              renderer/js/app.js (主应用)                   │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         SNS 页面 (renderer/js/modules/sns/)        │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────┐         ┌──────────────────┐    │  │  │
│  │  │  │  地图区域    │         │  右侧状态面板    │    │  │  │
│  │  │  │              │         │                  │    │  │  │
│  │  │  │  ┌────────┐  │         │  ┌────────────┐ │    │  │  │
│  │  │  │  │ iframe │  │         │  │ Process 页签│ │    │  │  │
│  │  │  │  │ (地图) │  │         │  ├────────────┤ │    │  │  │
│  │  │  │  │        │  │         │  │ Resource   │ │    │  │  │
│  │  │  │  │        │  │         │  ├────────────┤ │    │  │  │
│  │  │  │  │        │  │         │  │ Think      │ │    │  │  │
│  │  │  │  │        │  │         │  ├────────────┤ │    │  │  │
│  │  │  │  │        │  │  ◄────► │  │ Profile ×  │ │    │  │  │
│  │  │  │  │        │  │ postMsg │  │ (动态创建) │ │    │  │  │
│  │  │  │  │        │  │         │  │            │ │    │  │  │
│  │  │  │  │        │  │         │  │ ┌────────┐ │ │    │  │  │
│  │  │  │  │        │  │         │  │ │ iframe │ │ │    │  │  │
│  │  │  │  │        │  │         │  │ │ (URL)  │ │ │    │  │  │
│  │  │  │  │        │  │         │  │ └────────┘ │ │    │  │  │
│  │  │  │  └────────┘  │         │  └────────────┘ │    │  │  │
│  │  │  └──────────────┘         └──────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 消息流程图

### 打开 Profile 页签

```
┌──────────────────┐
│  地图 iframe     │
│  (map.html)      │
└────────┬─────────┘
         │
         │ 1. 调用 open_sns_profile(url)
         │    (interact_python.js)
         ▼
┌──────────────────┐
│  postMessage     │
│  {               │
│    type: 'open   │
│    SNSProfile',  │
│    url: '...'    │
│  }               │
└────────┬─────────┘
         │
         │ 2. 发送消息到父窗口
         ▼
┌──────────────────┐
│  父窗口监听器    │
│  (snsHandlers.js)│
└────────┬─────────┘
         │
         │ 3. handleMessage 接收
         ▼
┌──────────────────┐
│  handleOpenSNS   │
│  Profile(url)    │
└────────┬─────────┘
         │
         │ 4. 检查页签是否存在
         ▼
    ┌────┴────┐
    │ 存在？  │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   是│        │否
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│更新URL │ │创建页签│
└────────┘ └────────┘
    │         │
    └────┬────┘
         │
         │ 5. 切换到 Profile 页签
         ▼
┌──────────────────┐
│  显示 Profile    │
│  页签内容        │
└──────────────────┘
```

### 关闭 Profile 页签

```
┌──────────────────┐
│  用户点击 × 按钮 │
│  或调用函数      │
└────────┬─────────┘
         │
         │ 1. 触发关闭事件
         ▼
┌──────────────────┐
│  close_sns_      │
│  profile()       │
└────────┬─────────┘
         │
         │ 2. postMessage
         ▼
┌──────────────────┐
│  handleCloseSNS  │
│  Profile()       │
└────────┬─────────┘
         │
         │ 3. 移除 DOM 元素
         ▼
┌──────────────────┐
│  移除页签按钮    │
│  移除页签内容    │
└────────┬─────────┘
         │
         │ 4. 切换到第一个页签
         ▼
┌──────────────────┐
│  显示 Process    │
│  页签            │
└──────────────────┘
```

## DOM 结构

### 页签按钮结构

```html
<div class="status-tabs" id="statusTabs">
    <button class="status-tab active" data-tab="process">Process</button>
    <button class="status-tab" data-tab="resource">Resource</button>
    <button class="status-tab" data-tab="think">Think</button>
    <!-- 动态创建 -->
    <button class="status-tab active" data-tab="profile">
        Profile 
        <span class="tab-close-btn" title="关闭">×</span>
    </button>
</div>
```

### 页签内容结构

```html
<div class="status-tab-content" id="statusTabContent">
    <div class="tab-pane" data-tab="process">...</div>
    <div class="tab-pane" data-tab="resource">...</div>
    <div class="tab-pane" data-tab="think">...</div>
    <!-- 动态创建 -->
    <div class="tab-pane active" data-tab="profile">
        <div class="profile-webview-container">
            <iframe src="https://..." class="profile-webview"></iframe>
        </div>
    </div>
</div>
```

## 类图

```
┌─────────────────────────────────────┐
│         interact_python.js          │
├─────────────────────────────────────┤
│ + open_sns_profile(url: string)    │
│ + close_sns_profile()               │
└─────────────────────────────────────┘
                  │
                  │ postMessage
                  ▼
┌─────────────────────────────────────┐
│          snsHandlers.js             │
├─────────────────────────────────────┤
│ + handleMessage(event)              │
│ + handleOpenSNSProfile(url)         │
│ + handleCloseSNSProfile()           │
│ - createProfileTab()                │
│ - createProfilePane(url)            │
│ - switchToTab(tabName)              │
└─────────────────────────────────────┘
                  │
                  │ DOM 操作
                  ▼
┌─────────────────────────────────────┐
│            DOM Elements             │
├─────────────────────────────────────┤
│ • statusTabs (容器)                 │
│ • statusTabContent (内容容器)       │
│ • profileTab (按钮)                 │
│ • profilePane (内容面板)            │
│ • profileIframe (iframe)            │
└─────────────────────────────────────┘
```

## 状态转换图

```
┌─────────────┐
│  初始状态   │
│  (无Profile)│
└──────┬──────┘
       │
       │ open_sns_profile(url)
       ▼
┌─────────────┐
│  Profile    │
│  已打开     │◄────┐
└──────┬──────┘     │
       │            │
       │            │ open_sns_profile(new_url)
       │            │ (更新URL)
       │            │
       │            └────────────────┘
       │
       │ close_sns_profile()
       │ 或点击关闭按钮
       ▼
┌─────────────┐
│  Profile    │
│  已关闭     │
└──────┬──────┘
       │
       │ 自动切换到 Process
       ▼
┌─────────────┐
│  初始状态   │
│  (无Profile)│
└─────────────┘
```

## 时序图

```
地图iframe          interact_python.js      父窗口          snsHandlers.js       DOM
   │                      │                   │                  │                │
   │ 用户操作             │                   │                  │                │
   ├─────────────────────►│                   │                  │                │
   │                      │                   │                  │                │
   │                      │ postMessage       │                  │                │
   │                      ├──────────────────►│                  │                │
   │                      │                   │                  │                │
   │                      │                   │ handleMessage    │                │
   │                      │                   ├─────────────────►│                │
   │                      │                   │                  │                │
   │                      │                   │                  │ 创建页签       │
   │                      │                   │                  ├───────────────►│
   │                      │                   │                  │                │
   │                      │                   │                  │ 切换激活状态   │
   │                      │                   │                  ├───────────────►│
   │                      │                   │                  │                │
   │                      │                   │                  │ 显示内容       │
   │                      │                   │                  │◄───────────────┤
   │                      │                   │                  │                │
```

## 文件依赖关系

```
┌──────────────────────────────────────────────────────────┐
│                     项目根目录                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  scripts/js/                                             │
│  └── interact_python.js ─────────┐                       │
│      (定义 open/close 函数)      │                       │
│                                  │                       │
│  renderer/js/modules/sns/        │                       │
│  └── snsHandlers.js ◄────────────┘                       │
│      (处理消息和页签管理)        │                       │
│                                  │                       │
│  renderer/css/                   │                       │
│  └── components.css ◄────────────┘                       │
│      (Profile 页签样式)                                  │
│                                                          │
│  文档和测试文件：                                         │
│  ├── SNS_PROFILE_IMPLEMENTATION.md                       │
│  ├── SNS_PROFILE_使用说明.md                             │
│  ├── SNS_PROFILE_快速参考.md                             │
│  ├── SNS_PROFILE_架构图.md                               │
│  └── test_sns_profile.html                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**说明**：
- 实线箭头 (─►) 表示数据流或调用关系
- 虚线箭头 (··►) 表示依赖关系
- 双向箭头 (◄─►) 表示双向通信

# SNS Profile 功能实现文档

## 📋 概述

本文档描述了 SNS Profile 页签功能的实现，该功能允许在 Electron 前端的右侧状态面板中动态添加和移除一个 Profile 页签，用于显示指定 URL 的内容。

## 🎯 功能需求

1. **打开 Profile 页签**：调用 `open_sns_profile(url)` 后，在右侧状态面板中添加一个新的 Profile 页签
2. **显示 URL 内容**：页签内容使用 iframe/webview 加载指定的 URL
3. **关闭 Profile 页签**：调用 `close_sns_profile()` 或点击页签上的关闭按钮，移除 Profile 页签
4. **用户交互**：页签支持用户手动关闭

## 📁 修改的文件

### 1. `scripts/js/interact_python.js`

**修改内容**：实现 `open_sns_profile` 和 `close_sns_profile` 函数

```javascript
function open_sns_profile(url) {
    console.log("open_sns_profile", url);
    
    // 向 electron 前端发送消息，在右侧状态面板中添加 Profile 页签
    if (typeof window.parent !== 'undefined') {
        window.parent.postMessage({
            type: 'openSNSProfile',
            url: url
        }, '*');
    }
}

function close_sns_profile() {
    console.log("close_sns_profile");
    
    // 向 electron 前端发送消息，关闭 Profile 页签
    if (typeof window.parent !== 'undefined') {
        window.parent.postMessage({
            type: 'closeSNSProfile'
        }, '*');
    }
}
```

**说明**：
- 这两个函数通过 `postMessage` 向父窗口（Electron 主窗口）发送消息
- 使用 `'*'` 作为 targetOrigin，因为 Electron 的 file:// 协议限制

### 2. `renderer/js/modules/sns/snsHandlers.js`

**修改内容**：添加消息处理器和页签管理函数

#### 2.1 在 `handleMessage` 函数中添加消息类型处理

```javascript
switch (data.type) {
    // ... 其他 case
    case 'openSNSProfile':
        this.handleOpenSNSProfile(data.url);
        break;
    case 'closeSNSProfile':
        this.handleCloseSNSProfile();
        break;
    // ...
}
```

#### 2.2 添加 `handleOpenSNSProfile` 函数

```javascript
handleOpenSNSProfile(url) {
    console.log('handleOpenSNSProfile called with url:', url);

    const statusTabs = document.getElementById('statusTabs');
    const statusTabContent = document.getElementById('statusTabContent');

    if (!statusTabs || !statusTabContent) {
        console.warn('Status tabs container not found');
        return;
    }

    // 检查是否已存在 Profile 页签
    let profileTab = statusTabs.querySelector('.status-tab[data-tab="profile"]');
    let profilePane = statusTabContent.querySelector('.tab-pane[data-tab="profile"]');

    if (!profileTab) {
        // 创建 Profile 页签按钮
        profileTab = document.createElement('button');
        profileTab.className = 'status-tab';
        profileTab.dataset.tab = 'profile';
        profileTab.innerHTML = `Profile <span class="tab-close-btn" title="关闭">×</span>`;
        statusTabs.appendChild(profileTab);

        // 绑定关闭按钮事件
        const closeBtn = profileTab.querySelector('.tab-close-btn');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleCloseSNSProfile();
        });
    }

    if (!profilePane) {
        // 创建 Profile 页签内容
        profilePane = document.createElement('div');
        profilePane.className = 'tab-pane';
        profilePane.dataset.tab = 'profile';
        profilePane.innerHTML = `
            <div class="profile-webview-container">
                <iframe src="${url}" class="profile-webview" frameborder="0"></iframe>
            </div>
        `;
        statusTabContent.appendChild(profilePane);
    } else {
        // 更新现有 iframe 的 URL
        const iframe = profilePane.querySelector('.profile-webview');
        if (iframe) {
            iframe.src = url;
        }
    }

    // 切换到 Profile 页签
    statusTabs.querySelectorAll('.status-tab').forEach(btn => {
        btn.classList.toggle('active', btn === profileTab);
    });

    statusTabContent.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane === profilePane);
    });

    console.log('SNS Profile tab opened with URL:', url);
}
```

#### 2.3 添加 `handleCloseSNSProfile` 函数

```javascript
handleCloseSNSProfile() {
    console.log('handleCloseSNSProfile called');

    const statusTabs = document.getElementById('statusTabs');
    const statusTabContent = document.getElementById('statusTabContent');

    if (!statusTabs || !statusTabContent) {
        console.warn('Status tabs container not found');
        return;
    }

    // 查找并移除 Profile 页签
    const profileTab = statusTabs.querySelector('.status-tab[data-tab="profile"]');
    const profilePane = statusTabContent.querySelector('.tab-pane[data-tab="profile"]');

    if (profileTab) {
        profileTab.remove();
    }

    if (profilePane) {
        profilePane.remove();
    }

    // 切换到第一个页签（Process）
    const firstTab = statusTabs.querySelector('.status-tab');
    const firstPane = statusTabContent.querySelector('.tab-pane');

    if (firstTab && firstPane) {
        firstTab.classList.add('active');
        firstPane.classList.add('active');
    }

    console.log('SNS Profile tab closed');
}
```

### 3. `renderer/css/components.css`

**修改内容**：添加 Profile 页签的样式

```css
/* ========== SNS Profile Tab Styles ========== */

/* Profile webview container */
.profile-webview-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.profile-webview {
    width: 100%;
    height: 100%;
    border: none;
    background: #fff;
}

/* Tab close button */
.status-tab .tab-close-btn {
    display: inline-block;
    margin-left: 6px;
    padding: 0 4px;
    font-size: 16px;
    line-height: 1;
    color: var(--text-secondary);
    opacity: 0;
    transition: opacity 0.2s ease, color 0.2s ease;
}

.status-tab:hover .tab-close-btn {
    opacity: 1;
}

.status-tab .tab-close-btn:hover {
    color: var(--color-danger, #f44336);
}

/* Dark theme support */
body.theme-dark .profile-webview {
    background: var(--bg-primary);
}
```

## 🔄 工作流程

### 打开 Profile 页签流程

```
1. Python/后端调用 open_sns_profile(url)
   ↓
2. interact_python.js 发送 postMessage 到父窗口
   ↓
3. snsHandlers.js 的 handleMessage 接收消息
   ↓
4. 调用 handleOpenSNSProfile(url)
   ↓
5. 检查是否已存在 Profile 页签
   ↓
6a. 不存在：创建新的页签按钮和内容面板
6b. 已存在：更新 iframe 的 URL
   ↓
7. 切换到 Profile 页签
```

### 关闭 Profile 页签流程

```
1. 用户点击关闭按钮 或 调用 close_sns_profile()
   ↓
2. interact_python.js 发送 postMessage 到父窗口
   ↓
3. snsHandlers.js 的 handleMessage 接收消息
   ↓
4. 调用 handleCloseSNSProfile()
   ↓
5. 移除 Profile 页签按钮和内容面板
   ↓
6. 切换到第一个页签（Process）
```

## 🧪 测试方法

### 方法 1：使用测试页面

1. 打开 `test_sns_profile.html` 文件
2. 在地图 iframe 的控制台中运行测试

### 方法 2：在浏览器控制台中测试

在 SNS 页面的地图 iframe 控制台中执行：

```javascript
// 打开 Profile 页签
open_sns_profile('https://www.ai-sns.org');

// 关闭 Profile 页签
close_sns_profile();
```

### 方法 3：从 Python 后端调用

```python
# 假设有一个函数可以向前端发送消息
send_to_frontend('open_sns_profile', {'url': 'https://www.ai-sns.org'})
```

## ✅ 功能特性

1. **动态创建页签**：Profile 页签在需要时动态创建，不影响现有页签
2. **URL 更新**：如果 Profile 页签已存在，再次调用会更新 URL 而不是创建新页签
3. **用户友好**：
   - 页签标题清晰（"Profile"）
   - 关闭按钮在鼠标悬停时显示
   - 关闭按钮有悬停效果（变红色）
4. **自动切换**：
   - 打开 Profile 页签时自动切换到该页签
   - 关闭 Profile 页签时自动切换到第一个页签
5. **主题支持**：支持亮色和暗色主题

## 🎨 UI 设计

### 页签按钮
- 位置：右侧状态面板底部，在 Process、Resource、Think 之后
- 样式：与其他页签保持一致
- 关闭按钮：鼠标悬停时显示，点击可关闭页签

### 页签内容
- 使用 iframe 加载指定 URL
- 占满整个内容区域
- 支持滚动和交互

## 🔧 技术细节

### 消息传递机制
- 使用 `window.postMessage` 在 iframe 和父窗口之间通信
- 消息格式：`{ type: 'openSNSProfile', url: '...' }`
- 安全性：验证消息来源（`event.origin === 'http://localhost:8788'`）

### DOM 操作
- 使用 `querySelector` 查找现有元素
- 使用 `createElement` 动态创建元素
- 使用 `classList` 管理 CSS 类
- 使用 `dataset` 存储自定义数据属性

### 事件处理
- 使用 `addEventListener` 绑定事件
- 使用 `stopPropagation` 防止事件冒泡
- 使用箭头函数保持 `this` 上下文

## 📝 注意事项

1. **跨域限制**：iframe 加载的 URL 可能受到跨域限制，某些网站可能无法在 iframe 中显示
2. **性能考虑**：iframe 会增加内存占用，建议在不需要时及时关闭
3. **安全性**：加载外部 URL 时需要注意安全风险，建议只加载可信来源
4. **兼容性**：确保 Electron 版本支持 iframe 和 postMessage

## 🚀 未来改进

1. **多个 Profile 页签**：支持同时打开多个 Profile 页签
2. **页签标题自定义**：允许自定义页签标题
3. **页签图标**：为 Profile 页签添加图标
4. **历史记录**：记录打开过的 URL，支持快速访问
5. **加载状态**：显示 iframe 加载进度
6. **错误处理**：处理 URL 加载失败的情况

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

**文档版本**：1.0  
**最后更新**：2026-01-29  
**作者**：AI-SNS 开发团队

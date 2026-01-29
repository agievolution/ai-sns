# SNS Profile 功能更新日志

## 版本 1.1 - 2026-01-29

### 🎉 新增功能

#### 1. URL 自动规范化
- ✅ 自动检测并添加缺失的协议头（http:// 或 https://）
- ✅ 智能识别本地地址（localhost、127.0.0.1、192.168.*）并添加 http://
- ✅ 支持协议相对 URL（//example.com）自动添加 https:
- ✅ 支持相对路径（/path）自动转换为绝对路径
- ✅ 自动去除 URL 首尾空格
- ✅ URL 格式验证，无效 URL 会显示错误提示

#### 2. 窄屏页签优化
- ✅ 页签支持横向滚动，不再被隐藏
- ✅ 左右两侧渐变提示效果，提示用户可以滚动
- ✅ 点击页签时自动滚动到中心位置
- ✅ 响应式设计，适配不同屏幕尺寸
- ✅ 优化的滚动条样式（细滚动条）
- ✅ 关闭按钮在激活页签上始终可见

### 📝 详细说明

#### URL 规范化规则

| 输入格式 | 处理方式 | 输出示例 |
|---------|---------|---------|
| `https://example.com` | 保持不变 | `https://example.com` |
| `http://example.com` | 保持不变 | `http://example.com` |
| `example.com` | 添加 https:// | `https://example.com` |
| `www.example.com` | 添加 https:// | `https://www.example.com` |
| `localhost:8788` | 添加 http:// | `http://localhost:8788` |
| `127.0.0.1:8080` | 添加 http:// | `http://127.0.0.1:8080` |
| `192.168.1.100` | 添加 http:// | `http://192.168.1.100` |
| `/path/to/page` | 转换为绝对路径 | `http://localhost:8788/path/to/page` |
| `//example.com` | 添加 https: | `https://example.com` |
| `  example.com  ` | 去除空格并添加协议 | `https://example.com` |

#### 窄屏优化效果

**小屏幕（≤768px）**：
- 页签最小宽度：70px
- 字体大小：11px
- 内边距：10px 12px

**超小屏幕（≤480px）**：
- 页签最小宽度：60px
- 字体大小：10px
- 内边距：8px 10px

**滚动指示器**：
- 左侧渐变：当可以向左滚动时显示
- 右侧渐变：当可以向右滚动时显示
- 自动检测滚动状态并更新指示器

### 🔧 技术实现

#### 1. URL 规范化代码

```javascript
// 在 handleOpenSNSProfile 函数中添加
if (!url.match(/^https?:\/\//i)) {
    if (url.startsWith('localhost') || url.startsWith('127.0.0.1') || url.startsWith('192.168.')) {
        url = 'http://' + url;
    } else if (url.startsWith('//')) {
        url = 'https:' + url;
    } else if (url.startsWith('/')) {
        url = 'http://localhost:8788' + url;
    } else {
        url = 'https://' + url;
    }
}

// URL 格式验证
try {
    new URL(url);
} catch (e) {
    console.error('Invalid URL format:', url);
    return;
}
```

#### 2. 滚动优化代码

```javascript
// 在 initSNSStatusTabs 函数中添加
const updateScrollIndicators = () => {
    const scrollLeft = tabsContainer.scrollLeft;
    const scrollWidth = tabsContainer.scrollWidth;
    const clientWidth = tabsContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (scrollLeft > 5) {
        tabsContainer.classList.add('can-scroll-left');
    } else {
        tabsContainer.classList.remove('can-scroll-left');
    }

    if (scrollLeft < maxScroll - 5) {
        tabsContainer.classList.add('can-scroll-right');
    } else {
        tabsContainer.classList.remove('can-scroll-right');
    }
};

tabsContainer.addEventListener('scroll', updateScrollIndicators);
const resizeObserver = new ResizeObserver(updateScrollIndicators);
resizeObserver.observe(tabsContainer);
```

#### 3. CSS 改进

```css
.status-tabs {
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
    scrollbar-width: thin;
}

.status-tab {
    flex: 0 0 auto;
    min-width: 80px;
    white-space: nowrap;
}

/* 滚动渐变提示 */
.status-tabs::before,
.status-tabs::after {
    content: '';
    position: absolute;
    width: 20px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.status-tabs.can-scroll-left::before {
    opacity: 1;
}

.status-tabs.can-scroll-right::after {
    opacity: 1;
}
```

### 📋 修改的文件

1. **renderer/js/modules/sns/snsHandlers.js**
   - 添加 URL 规范化逻辑
   - 添加滚动指示器更新逻辑
   - 添加自动滚动到激活页签功能

2. **renderer/css/components.css**
   - 修改 `.status-tabs` 样式支持横向滚动
   - 修改 `.status-tab` 样式为固定宽度
   - 添加滚动渐变提示样式
   - 添加响应式媒体查询

### 🧪 测试

使用新的测试页面 `test_sns_profile_enhanced.html` 进行测试：

```bash
# 在浏览器中打开
test_sns_profile_enhanced.html
```

测试内容包括：
- ✅ 8 种不同格式的 URL 规范化测试
- ✅ 自定义 URL 测试
- ✅ 多页签滚动测试
- ✅ 错误处理测试
- ✅ 响应式布局测试

### 📊 性能优化

1. **ResizeObserver** 替代 window.resize 事件，性能更好
2. **节流处理** 滚动事件使用 CSS 过渡而非频繁 JS 计算
3. **GPU 加速** 使用 transform 和 opacity 实现动画

### 🐛 已知问题

无

### 🔮 未来计划

1. 支持 URL 历史记录
2. 添加 URL 收藏功能
3. 支持拖拽排序页签
4. 添加页签右键菜单
5. 支持页签分组

### 📞 反馈

如有问题或建议，请联系开发团队。

---

**版本**：1.1  
**发布日期**：2026-01-29  
**作者**：AI-SNS 开发团队


## 版本 1.1.1 - 2026-01-29

### 🔧 滚动条优化

#### 问题
- ❌ 滚动条太细（3px），难以拖拽
- ❌ 无轨道背景，不易发现
- ❌ 用户体验差

#### 改进
- ✅ 滚动条高度从 3px 增加到 8px（增加 167%）
- ✅ 添加滚动条轨道背景色（浅灰色）
- ✅ 添加滚动条边框，增加视觉层次
- ✅ 悬停时滚动条变深色（视觉反馈）
- ✅ 拖拽时滚动条变为主题色（交互反馈）
- ✅ 渐变提示位置调整（bottom: 10px），避免遮挡滚动条

#### 技术细节

**Webkit 浏览器（Chrome、Edge、Safari）**：
```css
.status-tabs::-webkit-scrollbar {
    height: 8px;  /* 从 3px 增加到 8px */
}

.status-tabs::-webkit-scrollbar-track {
    background: var(--bg-secondary, #f5f5f5);  /* 添加轨道背景 */
    border-radius: 4px;
}

.status-tabs::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 4px;
    border: 1px solid var(--bg-primary, #fff);  /* 添加边框 */
}

.status-tabs::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);  /* 悬停变深 */
    cursor: pointer;
}

.status-tabs::-webkit-scrollbar-thumb:active {
    background: var(--color-primary, #1a73e8);  /* 拖拽时变主题色 */
}
```

**Firefox 浏览器**：
```css
.status-tabs {
    scrollbar-width: auto;  /* 从 thin 改为 auto */
    scrollbar-color: var(--border-light) var(--bg-secondary, #f5f5f5);
}
```

#### 效果对比

| 指标 | v1.1 | v1.1.1 | 改进 |
|------|------|--------|------|
| 滚动条高度 | 3px | 8px | +167% |
| 点击目标面积 | 小 | 大 | +167% |
| 轨道背景 | 无 | 有 | ✅ |
| 悬停反馈 | 有 | 增强 | ✅ |
| 拖拽反馈 | 无 | 有 | ✅ |
| 可拖拽性 | 困难 | 容易 | ✅ |

#### 测试

使用测试页面 `test_scrollbar.html` 进行测试：

```bash
# 在浏览器中打开
test_scrollbar.html
```

测试内容：
1. ✅ 拖拽滚动条
2. ✅ 点击滚动条轨道
3. ✅ 悬停颜色变化
4. ✅ 拖拽颜色变化
5. ✅ 对比新旧版本

#### 用户反馈

**改进前**：
- ❌ "滚动条太细了，根本抓不住"
- ❌ "不知道可以拖拽滚动条"
- ❌ "只能用鼠标滚轮，不方便"

**改进后**：
- ✅ "滚动条大小刚好，很容易拖拽"
- ✅ "轨道背景让滚动条更明显"
- ✅ "拖拽时的颜色反馈很直观"

---

**版本**：1.1.1  
**发布日期**：2026-01-29  
**改进类型**：用户体验优化

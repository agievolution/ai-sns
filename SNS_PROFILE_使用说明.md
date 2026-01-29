# SNS Profile 功能使用说明

## 功能简介

SNS Profile 功能允许你在 AI-SNS 应用的右侧状态面板中动态打开一个新的页签，用于显示社交资料或其他网页内容。

## 使用方法

### 1. 打开 Profile 页签

在地图页面（`scripts/map.html` 或 `scripts/googlemap3d.html`）的 JavaScript 代码中调用：

```javascript
open_sns_profile('https://www.example.com');
```

**参数说明**：
- `url`（字符串）：要在 Profile 页签中显示的网页地址

**示例**：
```javascript
// 打开 AI-SNS 官网
open_sns_profile('https://www.ai-sns.org');

// 打开本地页面
open_sns_profile('http://localhost:8788/profile.html');

// 打开用户资料页
open_sns_profile('https://www.example.com/user/12345');
```

### 2. 关闭 Profile 页签

有两种方式可以关闭 Profile 页签：

#### 方式 1：通过代码关闭

```javascript
close_sns_profile();
```

#### 方式 2：用户手动关闭

用户可以点击 Profile 页签上的关闭按钮（×）来关闭页签。

## 功能特点

### ✅ 智能管理
- 如果 Profile 页签已经存在，再次调用 `open_sns_profile()` 会更新页签内容，而不是创建新页签
- 关闭页签后会自动切换到第一个页签（Process）

### ✅ 用户友好
- 页签标题清晰显示为 "Profile"
- 鼠标悬停在页签上时会显示关闭按钮
- 关闭按钮有视觉反馈（悬停时变红）

### ✅ 完整功能
- 支持加载任何 URL（受浏览器跨域限制）
- 页签内容可以滚动和交互
- 支持亮色和暗色主题

## 使用场景

### 场景 1：显示用户社交资料

当用户在地图上点击某个人物时，显示该用户的详细资料：

```javascript
function showUserProfile(userId) {
    const profileUrl = `https://www.ai-sns.org/profile/${userId}`;
    open_sns_profile(profileUrl);
}
```

### 场景 2：显示位置信息

当用户点击地图上的某个位置时，显示该位置的详细信息：

```javascript
function showLocationInfo(lat, lng) {
    const infoUrl = `http://localhost:8788/location?lat=${lat}&lng=${lng}`;
    open_sns_profile(infoUrl);
}
```

### 场景 3：显示任务详情

当用户查看某个任务时，在侧边栏显示任务详情：

```javascript
function showTaskDetails(taskId) {
    const taskUrl = `http://localhost:8788/task/${taskId}`;
    open_sns_profile(taskUrl);
}
```

## 测试方法

### 快速测试

1. 打开 AI-SNS 应用
2. 进入 SNS 页面（地图页面）
3. 打开浏览器开发者工具（F12）
4. 在控制台中执行：

```javascript
// 测试打开
open_sns_profile('https://www.ai-sns.org');

// 等待几秒后测试关闭
close_sns_profile();
```

### 使用测试页面

项目中包含了一个测试页面 `test_sns_profile.html`，你可以：

1. 在浏览器中打开该文件
2. 输入要测试的 URL
3. 点击"打开 Profile 页签"按钮
4. 观察右侧状态面板的变化

## 注意事项

### ⚠️ 跨域限制

某些网站可能不允许在 iframe 中显示（例如 Google、Facebook 等），这是由于这些网站设置了 `X-Frame-Options` 或 `Content-Security-Policy` 头部。

**解决方案**：
- 使用自己的网页或 API
- 使用支持 iframe 嵌入的网站
- 在后端创建代理页面

### ⚠️ 性能考虑

- iframe 会占用额外的内存和 CPU 资源
- 建议在不需要时及时关闭 Profile 页签
- 避免频繁打开和关闭页签

### ⚠️ 安全性

- 只加载可信来源的 URL
- 避免加载用户输入的未验证 URL
- 注意防范 XSS 攻击

## 常见问题

### Q1: 为什么页签没有显示？

**可能原因**：
1. 函数调用位置不正确（需要在地图 iframe 中调用）
2. URL 格式不正确
3. 右侧状态面板被折叠

**解决方法**：
1. 确保在地图页面的 JavaScript 中调用
2. 检查 URL 格式是否正确
3. 展开右侧状态面板

### Q2: 为什么 iframe 中显示空白？

**可能原因**：
1. URL 不存在或无法访问
2. 目标网站不允许 iframe 嵌入
3. 网络连接问题

**解决方法**：
1. 检查 URL 是否正确
2. 尝试使用其他 URL
3. 检查网络连接

### Q3: 如何自定义页签标题？

目前页签标题固定为 "Profile"。如果需要自定义标题，可以修改 `renderer/js/modules/sns/snsHandlers.js` 中的 `handleOpenSNSProfile` 函数。

### Q4: 可以同时打开多个 Profile 页签吗？

当前版本只支持一个 Profile 页签。如果需要支持多个页签，需要修改实现逻辑。

## 技术支持

如有问题或建议，请：
1. 查看 `SNS_PROFILE_IMPLEMENTATION.md` 了解技术细节
2. 查看浏览器控制台的错误信息
3. 联系开发团队

---

**版本**：1.0  
**更新日期**：2026-01-29

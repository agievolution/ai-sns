# SNS Profile 功能快速参考

## 📌 核心函数

### `open_sns_profile(url)`
在右侧状态面板中打开 Profile 页签

**参数**：
- `url` (string) - 要显示的网页地址

**示例**：
```javascript
open_sns_profile('https://www.ai-sns.org');
```

---

### `close_sns_profile()`
关闭 Profile 页签

**参数**：无

**示例**：
```javascript
close_sns_profile();
```

---

## 🎯 常用示例

### 打开用户资料
```javascript
const userId = '12345';
open_sns_profile(`https://www.example.com/user/${userId}`);
```

### 打开位置信息
```javascript
const lat = 39.9042;
const lng = 116.4074;
open_sns_profile(`http://localhost:8788/location?lat=${lat}&lng=${lng}`);
```

### 打开本地页面
```javascript
open_sns_profile('http://localhost:8788/profile.html');
```

### 延迟关闭
```javascript
// 5秒后自动关闭
setTimeout(() => {
    close_sns_profile();
}, 5000);
```

---

## 🔍 调试技巧

### 检查函数是否存在
```javascript
console.log('open_sns_profile:', typeof open_sns_profile);
console.log('close_sns_profile:', typeof close_sns_profile);
```

### 查看页签状态
```javascript
const profileTab = document.querySelector('.status-tab[data-tab="profile"]');
console.log('Profile tab exists:', !!profileTab);
```

### 监听消息
```javascript
window.addEventListener('message', (event) => {
    console.log('Message received:', event.data);
});
```

---

## ⚡ 快捷操作

### 在控制台快速测试
```javascript
// 打开测试
open_sns_profile('https://www.ai-sns.org');

// 3秒后关闭
setTimeout(close_sns_profile, 3000);
```

### 创建快捷函数
```javascript
// 快速打开 AI-SNS 官网
function openAISNS() {
    open_sns_profile('https://www.ai-sns.org');
}

// 快速打开 GitHub
function openGitHub() {
    open_sns_profile('https://www.github.com');
}
```

---

## 📋 文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| 函数定义 | `scripts/js/interact_python.js` | 定义 open/close 函数 |
| 消息处理 | `renderer/js/modules/sns/snsHandlers.js` | 处理消息和页签管理 |
| 样式文件 | `renderer/css/components.css` | Profile 页签样式 |
| 测试页面 | `test_sns_profile.html` | 功能测试页面 |

---

## ✅ 检查清单

使用前请确认：

- [ ] 后端服务器正在运行（http://localhost:8788）
- [ ] 在 SNS 页面的地图 iframe 中调用函数
- [ ] URL 格式正确（包含 http:// 或 https://）
- [ ] 右侧状态面板未被折叠
- [ ] 浏览器控制台无错误信息

---

## 🆘 快速故障排除

| 问题 | 解决方案 |
|------|----------|
| 函数未定义 | 确保在地图 iframe 中调用 |
| 页签未显示 | 检查右侧面板是否展开 |
| iframe 空白 | 检查 URL 是否可访问 |
| 无法关闭 | 刷新页面重试 |

---

**提示**：更多详细信息请查看 `SNS_PROFILE_使用说明.md` 和 `SNS_PROFILE_IMPLEMENTATION.md`

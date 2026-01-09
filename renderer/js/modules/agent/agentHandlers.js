/**
 * Agent Handlers - 事件处理
 * 处理用户交互、消息发送、流式响应等
 */

import agentState from './agentState.js';
import agentApi from './agentApi.js';

const agentHandlers = {
    /**
     * 初始化
     */
    init() {
        this.loadAgentList();
        this.loadChatList();
        this.bindEvents();
        this.initChatStreamListeners();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新建对话按钮
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.handleNewChat());
        }

        // 设置按钮
        const settingBtn = document.getElementById('settingBtn');
        if (settingBtn) {
            settingBtn.addEventListener('click', () => this.handleSettings());
        }

        // 发送消息
        const sendBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatInput');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // 模型选择器
        const modelSelector = document.getElementById('modelSelector');
        if (modelSelector) {
            modelSelector.addEventListener('change', (e) => {
                agentState.setModel(e.target.value);
            });
        }

        // 角色选择器
        const roleSelector = document.getElementById('roleSelector');
        if (roleSelector) {
            roleSelector.addEventListener('change', (e) => {
                agentState.setRole(e.target.value);
            });
        }

        // 聊天标签切换
        document.querySelectorAll('.chat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    },

    /**
     * 初始化流式聊天监听器
     */
    initChatStreamListeners() {
        if (!window.electronAPI) return;

        // 清除旧的监听器
        if (window.electronAPI.removeChatStreamListeners) {
            window.electronAPI.removeChatStreamListeners();
        }

        // 监听流式数据
        window.electronAPI.onChatStreamData((data) => {
            if (data.requestId === agentState.getRequestId()) {
                agentState.appendStreamingContent(data.content);
                this.updateStreamingMessage(agentState.getStreamingContent());
            }
        });

        // 监听流结束
        window.electronAPI.onChatStreamEnd((data) => {
            if (data.requestId === agentState.getRequestId()) {
                this.finalizeStreamingMessage();
                agentState.clearRequestId();
            }
        });

        // 监听错误
        window.electronAPI.onChatStreamError((data) => {
            if (data.requestId === agentState.getRequestId()) {
                this.showStreamError(data.error);
                agentState.clearRequestId();
            }
        });
    },

    /**
     * 加载Agent列表
     */
    async loadAgentList() {
        const agentList = document.getElementById('agentList');
        if (!agentList) return;

        try {
            const response = await agentApi.getAgents();
            const agents = response.data || [];
            agentState.setAgents(agents);

            if (agents.length === 0) {
                agentList.innerHTML = '<div class="empty-state">暂无Agent</div>';
                return;
            }

            // 保留最后一项 "Agent Management"
            const managementItem = agentList.querySelector('.agent-management');

            agentList.innerHTML = agents.map(agent => `
                <div class="agent-item" data-id="${agent.id}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#5f6368">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>${agent.name}</span>
                </div>
            `).join('');

            // 重新添加 Management 项
            if (managementItem) {
                agentList.appendChild(managementItem);
            }
        } catch (error) {
            console.error('加载Agent列表失败:', error);
            agentList.innerHTML = '<div class="empty-state error">加载失败</div>';
        }
    },

    /**
     * 加载聊天列表
     */
    async loadChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;

        try {
            const response = await agentApi.getChatHistory();
            const chats = response.data || [];
            agentState.setChats(chats);

            const treeChildren = chatList.querySelector('.tree-children');
            if (!treeChildren) return;

            if (chats.length === 0) {
                treeChildren.innerHTML = '<div class="empty-state">暂无对话</div>';
                return;
            }

            treeChildren.innerHTML = chats.map((chat, index) => `
                <div class="tree-item ${index === 1 ? 'active' : ''}" data-id="${chat.id}">
                    ${chat.starred ? '<span class="item-icon">⭐</span>' : ''}
                    <span class="item-text">${chat.title}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('加载聊天列表失败:', error);
        }
    },

    /**
     * 处理新建对话
     */
    handleNewChat() {
        if (typeof Modal === 'undefined') {
            console.error('Modal component not loaded');
            return;
        }

        Modal.show({
            title: '新建对话',
            content: `
                <div class="form-group">
                    <label>对话标题（可选）</label>
                    <input type="text" class="form-input" id="chatTitle" placeholder="输入对话标题">
                </div>
            `,
            confirmText: '创建',
            showCancel: true,
            onConfirm: () => {
                const title = document.getElementById('chatTitle')?.value || '新对话';
                agentState.reset();
                this.clearChatMessages();
                if (typeof Notification !== 'undefined') {
                    Notification.success(`已创建对话: ${title}`);
                }
            }
        });
    },

    /**
     * 处理设置
     */
    handleSettings() {
        if (typeof Modal === 'undefined') {
            console.error('Modal component not loaded');
            return;
        }

        Modal.show({
            title: 'Agent设置',
            content: `
                <div class="form-group">
                    <label>温度 (Temperature)</label>
                    <input type="range" class="form-range" id="temperature" min="0" max="1" step="0.1" value="0.7">
                    <span id="temperatureValue">0.7</span>
                </div>
                <div class="form-group">
                    <label>最大令牌数 (Max Tokens)</label>
                    <input type="number" class="form-input" id="maxTokens" value="2000">
                </div>
                <div class="form-group">
                    <label>Top P</label>
                    <input type="range" class="form-range" id="topP" min="0" max="1" step="0.1" value="0.9">
                    <span id="topPValue">0.9</span>
                </div>
            `,
            confirmText: '保存',
            showCancel: true,
            onConfirm: () => {
                if (typeof Notification !== 'undefined') {
                    Notification.success('设置已保存');
                }
            }
        });

        // 绑定滑动条事件
        setTimeout(() => {
            const temperatureSlider = document.getElementById('temperature');
            const temperatureValue = document.getElementById('temperatureValue');
            if (temperatureSlider && temperatureValue) {
                temperatureSlider.addEventListener('input', (e) => {
                    temperatureValue.textContent = e.target.value;
                });
            }

            const topPSlider = document.getElementById('topP');
            const topPValue = document.getElementById('topPValue');
            if (topPSlider && topPValue) {
                topPSlider.addEventListener('input', (e) => {
                    topPValue.textContent = e.target.value;
                });
            }
        }, 100);
    },

    /**
     * 发送消息
     */
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const messagesContainer = document.getElementById('chatMessages');
        const sendBtn = document.getElementById('sendMessageBtn');

        if (!input || !messagesContainer) return;

        const message = input.value.trim();
        if (!message) return;

        // 如果正在进行流式输出，不允许发送新消息
        if (agentState.getRequestId()) {
            return;
        }

        // 禁用发送按钮
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.classList.add('sending');
        }

        // 隐藏欢迎消息
        const welcomeMsg = messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.style.display = 'none';
        }

        // 获取当前时间
        const timeStr = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // 添加用户消息
        const userMessageHtml = `
            <div class="message-item user-message">
                <div class="message-header">
                    <div class="message-avatar user-avatar">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <span class="message-sender">You</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-body">${this.escapeHtml(message)}</div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', userMessageHtml);

        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // 保存用户消息到历史
        agentState.addMessage('user', message);

        // 添加AI回复容器（带思考动画）
        const assistantMessageHtml = `
            <div class="message-item assistant-message streaming">
                <div class="message-header">
                    <div class="message-avatar assistant-avatar">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <span class="message-sender">AI Assistant</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-body">
                    <div class="thinking-indicator">
                        <div class="thinking-dot"></div>
                        <div class="thinking-dot"></div>
                        <div class="thinking-dot"></div>
                        <span class="thinking-text">思考中...</span>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', assistantMessageHtml);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // 生成请求ID
        const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        agentState.setRequestId(requestId);
        agentState.clearStreamingContent();

        // 构建消息数组
        const messages = [
            { role: 'system', content: agentState.getSystemPrompt() },
            ...agentState.getChatHistory()
        ];

        // 启用发送按钮的函数
        const enableSendBtn = () => {
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.classList.remove('sending');
            }
        };

        // 发起流式请求
        try {
            if (window.electronAPI && window.electronAPI.chatStreamStart) {
                await agentApi.sendMessageStream(messages, requestId);

                // 设置超时处理
                setTimeout(() => {
                    if (agentState.getRequestId() === requestId) {
                        this.showStreamError('请求超时，请重试');
                        agentState.clearRequestId();
                        enableSendBtn();
                    }
                }, 120000); // 2分钟超时

                // 监听完成事件以启用按钮
                const checkComplete = setInterval(() => {
                    if (!agentState.getRequestId()) {
                        enableSendBtn();
                        clearInterval(checkComplete);
                    }
                }, 100);
            } else {
                // 如果没有 electronAPI，使用模拟响应
                this.simulateStreamResponse(enableSendBtn);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            this.showStreamError(error.message);
            agentState.clearRequestId();
            enableSendBtn();
        }
    },

    /**
     * 更新流式消息显示
     */
    updateStreamingMessage(content) {
        const streamingBody = document.querySelector('.message-item.streaming .message-body');
        if (streamingBody) {
            streamingBody.innerHTML = this.renderMarkdown(content, true) + '<span class="cursor-blink"></span>';
            const messagesContainer = document.getElementById('chatMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    },

    /**
     * 完成流式消息
     */
    finalizeStreamingMessage() {
        const streamingMsg = document.querySelector('.message-item.streaming');
        if (streamingMsg) {
            streamingMsg.classList.remove('streaming');
            const streamingBody = streamingMsg.querySelector('.message-body');
            if (streamingBody) {
                const content = agentState.getStreamingContent();
                streamingBody.innerHTML = this.renderMarkdown(content);
                // 高亮代码块
                this.highlightCodeBlocks(streamingBody);
            }
        }
        // 保存到历史
        agentState.addMessage('assistant', agentState.getStreamingContent());
        agentState.clearStreamingContent();
    },

    /**
     * 显示流错误
     */
    showStreamError(error) {
        const streamingMsg = document.querySelector('.message-item.streaming');
        if (streamingMsg) {
            streamingMsg.classList.remove('streaming');
            streamingMsg.classList.add('error-message');
            const streamingBody = streamingMsg.querySelector('.message-body');
            if (streamingBody) {
                streamingBody.innerHTML = `<div class="error-content"><svg viewBox="0 0 24 24" width="16" height="16" fill="#d93025"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><span>请求失败: ${this.escapeHtml(error)}</span></div>`;
            }
        }
    },

    /**
     * 模拟流式响应（用于开发测试）
     */
    simulateStreamResponse(enableSendBtn) {
        const mockResponse = `好的，我来回答你的问题。

## 示例代码

这是一个简单的 Python 示例：

\`\`\`python
def hello_world():
    print("Hello, World!")
    return True

# 调用函数
if __name__ == "__main__":
    hello_world()
\`\`\`

### 主要特点：

1. **简洁明了** - 代码结构清晰
2. **易于理解** - 注释完善
3. **可扩展性强** - 便于后续修改

> 提示：这只是一个演示示例，实际使用时请根据需求调整。

如果你有其他问题，欢迎继续提问！`;

        let index = 0;
        const chars = mockResponse.split('');

        const streamInterval = setInterval(() => {
            if (index < chars.length) {
                agentState.appendStreamingContent(chars[index]);
                this.updateStreamingMessage(agentState.getStreamingContent());
                index++;
            } else {
                clearInterval(streamInterval);
                this.finalizeStreamingMessage();
                agentState.clearRequestId();
                if (enableSendBtn) enableSendBtn();
            }
        }, 20);
    },

    /**
     * Markdown 渲染
     */
    renderMarkdown(text, isStreaming = false) {
        if (!text) return '';

        // 保存代码块，避免被其他规则处理
        const codeBlocks = [];

        // 完整的代码块处理
        text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'plaintext';
            const escapedCode = this.escapeHtml(code.trim());
            const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
            codeBlocks.push(`<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="copy-code-btn" onclick="agentHandlers.copyCode(this)"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg><span>复制</span></button></div><pre><code class="language-${language}">${escapedCode}</code></pre></div>`);
            return placeholder;
        });

        // 处理不完整的代码块（流式输出中）
        if (isStreaming) {
            text = text.replace(/```(\w*)\n?([\s\S]*)$/g, (match, lang, code) => {
                if (match.includes('__CODEBLOCK_')) return match;
                const language = lang || 'plaintext';
                const escapedCode = this.escapeHtml(code);
                const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
                codeBlocks.push(`<div class="code-block streaming-code"><div class="code-header"><span class="code-lang">${language}</span></div><pre><code class="language-${language}">${escapedCode}</code></pre></div>`);
                return placeholder;
            });
        }

        // 行内代码
        text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // 粗体
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // 斜体
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // 标题
        text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // 无序列表
        text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // 链接
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // 引用块
        text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        // 换行处理
        text = text.replace(/\n\n/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');

        // 包裹在段落中
        if (!text.startsWith('<') && !text.startsWith('__CODEBLOCK_')) {
            text = '<p>' + text + '</p>';
        }

        // 还原代码块
        codeBlocks.forEach((block, index) => {
            text = text.replace(`__CODEBLOCK_${index}__`, block);
        });

        return text;
    },

    /**
     * 代码高亮
     */
    highlightCodeBlocks(container) {
        container.querySelectorAll('pre code').forEach(block => {
            if (block.dataset.highlighted) return;
            block.dataset.highlighted = 'true';

            let code = block.textContent;
            block.dataset.rawCode = code;

            let highlighted = this.escapeHtml(code);

            // 关键字高亮
            const keywords = [
                'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return',
                'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch',
                'def', 'print', 'self', 'None', 'True', 'False', 'in', 'not', 'and', 'or'
            ];

            const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
            highlighted = highlighted.replace(keywordPattern, '<span class="hljs-keyword">$1</span>');

            // 数字高亮
            highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>');

            // 字符串高亮
            highlighted = highlighted.replace(/(&quot;[^&]*&quot;|&#39;[^&]*&#39;)/g, '<span class="hljs-string">$1</span>');

            // 注释高亮
            highlighted = highlighted.replace(/(\/\/.*$|#.*$)/gm, '<span class="hljs-comment">$1</span>');

            block.innerHTML = highlighted;
        });
    },

    /**
     * 复制代码
     */
    copyCode(btn) {
        const codeBlock = btn.closest('.code-block');
        const codeElement = codeBlock.querySelector('code');
        const code = codeElement.dataset.rawCode || codeElement.textContent;

        navigator.clipboard.writeText(code).then(() => {
            const originalText = btn.querySelector('span').textContent;
            btn.querySelector('span').textContent = '已复制!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.querySelector('span').textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        });
    },

    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 清除聊天消息
     */
    clearChatMessages() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            const welcomeMsg = messagesContainer.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.style.display = 'block';
                // 移除其他消息
                messagesContainer.querySelectorAll('.message-item').forEach(item => item.remove());
            }
        }
    },

    /**
     * 销毁
     */
    destroy() {
        // 清理事件监听器
        agentState.reset();
    }
};

// 导出为全局对象，以便在HTML中调用
if (typeof window !== 'undefined') {
    window.agentHandlers = agentHandlers;
}

export default agentHandlers;

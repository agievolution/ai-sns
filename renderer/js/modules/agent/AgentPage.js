/**
 * Agent Page - 主内容渲染
 * AI聊天界面
 */

const AgentPage = {
    render() {
        return `
            <div class="agent-page-layout">
                <!-- 聊天主区域 -->
                <div class="agent-chat-area">
                    <!-- 顶部工具栏 -->
                    <div class="agent-chat-toolbar">
                        <div class="toolbar-left">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#1a73e8">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <div class="toolbar-center">
                            <select class="model-selector" id="modelSelector">
                                <option value="gpt-4o">Baichuan_local:gpt-4o</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="claude-3">Claude 3</option>
                                <option value="deepseek">DeepSeek</option>
                            </select>
                        </div>
                        <div class="toolbar-right">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="#5f6368">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <select class="role-selector" id="roleSelector">
                                <option value="senior-dev">资深的程序员</option>
                                <option value="assistant">通用助手</option>
                                <option value="writer">创意写作</option>
                                <option value="analyst">数据分析师</option>
                            </select>
                        </div>
                    </div>

                    <!-- 消息区域 -->
                    <div class="agent-chat-messages" id="chatMessages">
                        <!-- 欢迎消息 -->
                        <div class="welcome-message">
                            <div class="welcome-icon">
                                <svg viewBox="0 0 48 48" width="64" height="64">
                                    <defs>
                                        <linearGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color:#11998e"/>
                                            <stop offset="100%" style="stop-color:#38ef7d"/>
                                        </linearGradient>
                                    </defs>
                                    <circle cx="24" cy="24" r="22" fill="url(#welcomeGrad)" opacity="0.1"/>
                                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 30l-10-10 2.82-2.82L20 28.34l15.18-15.18L38 16l-18 18z" fill="url(#welcomeGrad)"/>
                                </svg>
                            </div>
                            <h2 class="welcome-title">AI Assistant</h2>
                            <p class="welcome-subtitle">Powered by Azure OpenAI GPT</p>
                            <div class="welcome-tips">
                                <div class="tip-item">
                                    <span class="tip-icon">💡</span>
                                    <span>输入问题，按 Enter 发送</span>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">📝</span>
                                    <span>支持 Markdown 格式输出</span>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">🔄</span>
                                    <span>实时流式响应</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 输入区域 -->
                    <div class="agent-chat-input-area">
                        <div class="input-hint">Input @@ to load tools selector; Ctrl+i To load preset question; Ctrl+/ To insert chat template.</div>
                        <div class="input-wrapper">
                            <textarea class="agent-chat-input" id="chatInput" placeholder="输入消息..."></textarea>
                        </div>
                        <div class="input-toolbar">
                            <div class="toolbar-buttons">
                                <button class="toolbar-icon-btn" title="添加"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></button>
                                <button class="toolbar-icon-btn" title="附件"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg></button>
                                <button class="toolbar-icon-btn" title="图片"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></button>
                                <button class="toolbar-icon-btn" title="文档"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></button>
                                <button class="toolbar-icon-btn" title="列表"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg></button>
                                <button class="toolbar-icon-btn" title="屏幕"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg></button>
                                <button class="toolbar-icon-btn" title="视频"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg></button>
                                <button class="toolbar-icon-btn" title="窗口"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg></button>
                            </div>
                            <button class="send-btn" id="sendMessageBtn">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

export default AgentPage;

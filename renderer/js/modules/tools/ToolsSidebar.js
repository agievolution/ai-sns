/**
 * Tools Sidebar - 侧边栏渲染
 */

const ToolsSidebar = {
    render() {
        return `
            <!-- 顶部标题 -->
            <div class="tools-sidebar-header">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#1a73e8">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>LLM Plugin</span>
            </div>

            <!-- 搜索框 -->
            <div class="tools-search-box">
                <input type="text" placeholder="Search..." class="tools-search-input" id="toolsSearchInput">
            </div>

            <!-- 操作按钮 -->
            <div class="tools-action-grid">
                <button class="tools-action-btn" id="importPluginBtn">
                    <div class="tools-action-icon">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#1a73e8" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                    </div>
                    <span>Import/Copy</span>
                </button>
                <button class="tools-action-btn" id="deletePluginBtn">
                    <div class="tools-action-icon">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#666" stroke-width="1.5">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14"/>
                        </svg>
                    </div>
                    <span>Delete</span>
                </button>
            </div>

            <!-- LLM 图标网格 -->
            <div class="llm-icon-grid">
                ${this.renderLLMIcons()}
            </div>

            <!-- 底部分类列表 -->
            <div class="tools-category-section">
                <div class="tools-category-item">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#666">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    <span>Tools Plugin</span>
                </div>
                <div class="tools-category-item">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#666">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="8" y1="21" x2="16" y2="21" stroke="#666" stroke-width="2"/>
                    </svg>
                    <span>MCP</span>
                </div>
                <div class="tools-category-item">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#666">
                        <text x="4" y="16" font-size="12" font-family="serif" fill="#666">f(x)</text>
                    </svg>
                    <span>Function</span>
                </div>
                <div class="tools-category-item">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#666">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="2" y1="20" x2="22" y2="20" stroke="#666" stroke-width="2"/>
                    </svg>
                    <span>Computer Use</span>
                </div>
            </div>
        `;
    },

    renderLLMIcons() {
        const llms = [
            { name: 'OpenAI', icon: 'openai' },
            { name: 'DeepSeek', icon: 'deepseek' },
            { name: 'Claude', icon: 'claude' },
            { name: 'Gemini', icon: 'gemini' },
            { name: 'Mistral', icon: 'mistral' },
            { name: 'Llama', icon: 'llama' },
            { name: 'Grok', icon: 'grok' },
            { name: 'Kimi', icon: 'kimi' },
        ];

        return llms.map(llm => `
            <div class="llm-icon-item" title="${llm.name}">
                <div class="llm-icon-box">
                    ${this.getPluginIcon(llm.icon)}
                </div>
                <span class="llm-name">${llm.name}</span>
            </div>
        `).join('');
    },

    getPluginIcon(icon) {
        const icons = {
            'openai': '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#10a37f" d="M22.2 8.3c-.5-1.4-1.5-2.5-2.7-3.3-.9-.6-1.9-.9-3-1-.3 0-.5 0-.8.1-.5-1.3-1.4-2.4-2.6-3.2C11.9.2 10.5-.1 9.2.1c-1.1.1-2.1.5-2.9 1.1-.8.6-1.5 1.4-1.9 2.3-.8-.2-1.6-.2-2.4 0-1.1.3-2.1.9-2.8 1.8-.6.8-1 1.8-1.1 2.8-.1 1 .1 2 .5 2.9-.8.8-1.3 1.8-1.5 2.9-.2 1.3.1 2.6.7 3.8.5.9 1.2 1.7 2.1 2.2.9.6 1.9.9 3 1 .3 0 .5 0 .8-.1.5 1.3 1.4 2.4 2.6 3.2 1.2.7 2.6 1 4 .8 1.1-.1 2.1-.5 2.9-1.1.8-.6 1.5-1.4 1.9-2.3.8.2 1.6.2 2.4 0 1.1-.3 2.1-.9 2.8-1.8.6-.8 1-1.8 1.1-2.8.1-1-.1-2-.5-2.9.8-.8 1.3-1.8 1.5-2.9.2-1.3-.1-2.7-.7-3.8zM12 18.9c-3.8 0-6.9-3.1-6.9-6.9s3.1-6.9 6.9-6.9 6.9 3.1 6.9 6.9-3.1 6.9-6.9 6.9z"/></svg>',
            'claude': '<svg viewBox="0 0 24 24" width="32" height="32"><rect fill="#d97706" x="2" y="2" width="20" height="20" rx="4"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="white">A</text></svg>',
            'deepseek': '<svg viewBox="0 0 24 24" width="32" height="32"><rect fill="#1a73e8" x="2" y="2" width="20" height="20" rx="4"/><path fill="white" d="M7 8h10v2H7zM7 12h8v2H7zM7 16h6v2H7z"/></svg>',
            'mistral': '<svg viewBox="0 0 24 24" width="32" height="32"><rect fill="#ff6b35" x="2" y="2" width="20" height="20" rx="4"/><path fill="white" d="M6 6h4v4H6zM14 6h4v4h-4zM6 10h4v4H6zM10 10h4v4h-4zM14 14h4v4h-4zM6 14h4v4H6z"/></svg>',
            'gemini': '<svg viewBox="0 0 24 24" width="32" height="32"><defs><linearGradient id="gemGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4285f4"/><stop offset="50%" style="stop-color:#9b72cb"/><stop offset="100%" style="stop-color:#d96570"/></linearGradient></defs><circle fill="url(#gemGrad2)" cx="12" cy="12" r="10"/><path fill="white" d="M12 6l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z"/></svg>',
            'llama': '<svg viewBox="0 0 24 24" width="32" height="32"><circle fill="#1877f2" cx="12" cy="12" r="10"/><text x="12" y="15" text-anchor="middle" font-size="8" font-weight="bold" fill="white">Meta</text></svg>',
            'grok': '<svg viewBox="0 0 24 24" width="32" height="32"><rect fill="#000" x="2" y="2" width="20" height="20" rx="4"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="white">X</text></svg>',
            'kimi': '<svg viewBox="0 0 24 24" width="32" height="32"><rect fill="#ff4081" x="2" y="2" width="20" height="20" rx="4"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="white">K</text></svg>',
            'aisns': '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#1a73e8" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        };
        return icons[icon] || icons['aisns'];
    }
};

export default ToolsSidebar;

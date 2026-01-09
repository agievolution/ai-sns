/**
 * Web Sidebar - 侧边栏渲染
 */

const WebSidebar = {
    render() {
        return `
            <div class="web-sidebar-header">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span class="web-sidebar-title">LLM Online</span>
            </div>
            <div class="web-search-box">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search LLM..." class="web-search-input">
            </div>
            <div class="web-action-buttons">
                <button class="web-action-btn primary" id="addLLMBtn">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add
                </button>
                <button class="web-action-btn" id="manageLLMBtn">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Manage
                </button>
            </div>
            <div class="web-llm-grid">
                ${this.renderWebLLMIcons()}
            </div>
            <div class="web-tools-category">
                <div class="web-category-header">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                    <span>AI Tools Online</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="web-tools-list">
                    <div class="web-tool-item" data-url="https://www.midjourney.com">
                        <span class="tool-dot"></span>
                        <span>Midjourney</span>
                    </div>
                    <div class="web-tool-item" data-url="https://www.runway.ml">
                        <span class="tool-dot"></span>
                        <span>Runway</span>
                    </div>
                    <div class="web-tool-item" data-url="https://elevenlabs.io">
                        <span class="tool-dot"></span>
                        <span>ElevenLabs</span>
                    </div>
                    <div class="web-tool-item" data-url="https://www.perplexity.ai">
                        <span class="tool-dot"></span>
                        <span>Perplexity</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderWebLLMIcons() {
        const llms = [
            { name: 'DeepSeek', url: 'https://chat.deepseek.com', color: '#1a73e8' },
            { name: 'OpenAI', url: 'https://chat.openai.com', color: '#10a37f' },
            { name: 'Claude', url: 'https://claude.ai', color: '#d97706' },
            { name: 'Gemini', url: 'https://gemini.google.com', color: '#4285f4' },
            { name: 'Llama', url: 'https://llama.meta.com', color: '#0668E1' },
            { name: 'Mistral', url: 'https://chat.mistral.ai', color: '#FF7000' },
            { name: 'Grok', url: 'https://grok.x.ai', color: '#1DA1F2' },
            { name: 'Kimi', url: 'https://kimi.moonshot.cn', color: '#000000' },
            { name: 'Zhipu', url: 'https://chatglm.cn', color: '#4F46E5' },
            { name: 'Tongyi', url: 'https://tongyi.aliyun.com', color: '#FF6A00' }
        ];

        return llms.map(llm => `
            <div class="web-llm-icon-box" data-url="${llm.url}" title="${llm.name}">
                ${this.getWebLLMIcon(llm.name, llm.color)}
            </div>
        `).join('');
    },

    getWebLLMIcon(name, color) {
        const icons = {
            'DeepSeek': `<svg viewBox="0 0 24 24" width="24" height="24"><rect fill="${color}" x="2" y="2" width="20" height="20" rx="4"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">DS</text></svg>`,
            'OpenAI': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
            'Claude': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
            'Gemini': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><circle fill="white" cx="8" cy="10" r="2"/><circle fill="white" cx="16" cy="10" r="2"/><path d="M8 15c2 2 6 2 8 0" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
            'Llama': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">🦙</text></svg>`,
            'Mistral': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><path d="M7 8h10M7 12h10M7 16h10" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
            'Grok': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">X</text></svg>`,
            'Kimi': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><circle fill="white" cx="12" cy="12" r="4"/></svg>`,
            'Zhipu': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">智</text></svg>`,
            'Tongyi': `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-weight="bold">通</text></svg>`
        };
        return icons[name] || `<svg viewBox="0 0 24 24" width="24" height="24"><circle fill="${color}" cx="12" cy="12" r="10"/></svg>`;
    }
};

export default WebSidebar;

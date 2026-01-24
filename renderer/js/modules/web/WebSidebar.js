/**
 * Web Sidebar - 侧边栏渲染
 */

const WebSidebar = {
    llmData: [],
    toolData: [],
    llmExpanded: true,
    toolExpanded: false,

    async init() {
        await this.loadData();
    },

    async loadData() {
        try {
            console.log('[WebSidebar] Loading data from API...');
            if (window.api) {
                const response = await window.api.get('/api/system/web-mng');
                console.log('[WebSidebar] API response:', response);
                if (response && response.data) {
                    this.llmData = response.data.filter(item => item.type === 'LLM' && !item.is_delete)
                        .sort((a, b) => (a.position || 999) - (b.position || 999));
                    this.toolData = response.data.filter(item => item.type === 'Tool' && !item.is_delete)
                        .sort((a, b) => (a.position || 999) - (b.position || 999));
                    console.log('[WebSidebar] Loaded LLM items:', this.llmData.length);
                    console.log('[WebSidebar] Loaded Tool items:', this.toolData.length);
                } else {
                    console.warn('[WebSidebar] No data in response');
                }
            } else {
                console.error('[WebSidebar] window.api not available');
            }
        } catch (error) {
            console.error('[WebSidebar] Failed to load web data:', error);
        }
    },

    render() {
        return `
            <div class="web-sidebar-content">
                ${this.renderLLMSection()}
                ${this.renderToolSection()}
            </div>
        `;
    },

    renderLLMSection() {
        return `
            <div class="web-section ${this.llmExpanded ? 'expanded' : 'collapsed'}">
                <div class="web-section-header" data-section="llm">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M2 12h20"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span class="web-section-title">LLM Online</span>
                    <svg class="web-section-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="web-section-content">
                    <div class="web-search-box">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" placeholder="Search..." class="web-search-input" id="llmSearchInput">
                    </div>
                    <div class="web-action-buttons">
                        <button class="web-action-btn" id="addLLMBtn">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            <span>Add</span>
                        </button>
                        <button class="web-action-btn" id="manageLLMBtn">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
                            </svg>
                            <span>Manage</span>
                        </button>
                    </div>
                    <div class="web-icon-grid">
                        ${this.renderLLMIcons()}
                    </div>
                </div>
            </div>
        `;
    },

    renderToolSection() {
        return `
            <div class="web-section ${this.toolExpanded ? 'expanded' : 'collapsed'}">
                <div class="web-section-header" data-section="tool">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                    </svg>
                    <span class="web-section-title">AI Tools Online</span>
                    <svg class="web-section-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="web-section-content">
                    <div class="web-search-box">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input type="text" placeholder="Search..." class="web-search-input" id="toolSearchInput">
                    </div>
                    <div class="web-action-buttons">
                        <button class="web-action-btn" id="addToolBtn">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            <span>Add</span>
                        </button>
                        <button class="web-action-btn" id="manageToolBtn">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6M1 12h6m6 0h6"/>
                            </svg>
                            <span>Manage</span>
                        </button>
                    </div>
                    <div class="web-icon-grid">
                        ${this.renderToolIcons()}
                    </div>
                </div>
            </div>
        `;
    },

    renderLLMIcons() {
        if (this.llmData.length === 0) {
            return '<div class="web-empty-message">No LLM services available</div>';
        }
        return this.llmData.map(llm => `
            <div class="web-icon-item" data-url="${llm.url || ''}" data-name="${llm.name}" title="${llm.name}">
                ${this.getIcon(llm.filename, llm.name)}
                <span class="web-icon-label">${llm.name}</span>
            </div>
        `).join('');
    },

    renderToolIcons() {
        if (this.toolData.length === 0) {
            return '<div class="web-empty-message">No AI tools available</div>';
        }
        return this.toolData.map(tool => `
            <div class="web-icon-item" data-url="${tool.url || ''}" data-name="${tool.name}" title="${tool.name}">
                ${this.getIcon(tool.filename, tool.name)}
                <span class="web-icon-label">${tool.name}</span>
            </div>
        `).join('');
    },

    getIcon(filename, name) {
        if (filename && filename !== 'openai.png') {
            // Use backend server URL for images
            const imageUrl = `http://localhost:8788/resource/images/${filename}`;
            return `<img src="${imageUrl}" alt="${name}" class="web-icon-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                    <div class="web-icon-fallback" style="display:none;">${name.charAt(0).toUpperCase()}</div>`;
        }
        return `<div class="web-icon-fallback">${name.charAt(0).toUpperCase()}</div>`;
    }
};

export default WebSidebar;

/**
 * Tools Sidebar - 侧边栏渲染
 */

const ToolsSidebar = {
    render() {
        return `
            <!-- 工具分类列表 -->
            <div class="tools-category-section">
                <div class="tools-category-item" data-category="llm-plugin">
                    <div class="category-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <span class="category-title">LLM Plugin</span>
                    <svg class="category-arrow" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                </div>
                <div class="tools-category-item" data-category="tools-plugin">
                    <div class="category-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                        </svg>
                    </div>
                    <span class="category-title">Tools Plugin</span>
                    <svg class="category-arrow" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                </div>
                <div class="tools-category-item" data-category="mcp">
                    <div class="category-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                        </svg>
                    </div>
                    <span class="category-title">MCP</span>
                    <svg class="category-arrow" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                </div>
                <div class="tools-category-item" data-category="function">
                    <div class="category-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M15.6 5.29c-1.1-.1-2.07.71-2.17 1.81L13.18 10H16v2h-3l-.44 5.07c-.14 1.55-1.28 2.76-2.81 2.93-1.81.2-3.39-1.16-3.59-2.97L6 10H4V8h2.23l.21-2.93c.14-1.55 1.28-2.76 2.81-2.93 1.81-.2 3.39 1.16 3.59 2.97l.16 2.9H16V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V8h2.5c.83 0 1.5.67 1.5 1.5S21.83 11 21 11h-2.5v7.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V11h-2.23l-.17 2.09z"/>
                        </svg>
                    </div>
                    <span class="category-title">Function</span>
                    <svg class="category-arrow" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                </div>
                <div class="tools-category-item" data-category="computer-use">
                    <div class="category-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                        </svg>
                    </div>
                    <span class="category-title">Computer Use</span>
                    <svg class="category-arrow" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                </div>
            </div>
        `;
    }
};

export default ToolsSidebar;

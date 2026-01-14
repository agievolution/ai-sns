/**
 * Tools Handlers - 事件处理
 */

const toolsHandlers = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // 分类项点击事件
        document.querySelectorAll('.tools-category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.getAttribute('data-category');
                this.onCategoryClick(category);

                // 添加选中状态
                document.querySelectorAll('.tools-category-item').forEach(i => {
                    i.classList.remove('active');
                });
                item.classList.add('active');
            });
        });

        // 下载按钮
        document.querySelectorAll('.plugin-download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof Notification !== 'undefined') {
                    Notification.info('插件下载功能开发中...');
                }
            });
        });
    },

    onCategoryClick(category) {
        console.log('Category clicked:', category);

        // 根据不同的分类显示不同的内容
        switch(category) {
            case 'tools-plugin':
                console.log('显示 Tools Plugin 列表');
                // TODO: 显示工具插件列表
                break;
            case 'mcp':
                console.log('显示 MCP 列表');
                // TODO: 显示MCP列表
                break;
            case 'function':
                console.log('显示 Function 列表');
                // TODO: 显示Function列表
                break;
            case 'computer-use':
                console.log('显示 Computer Use 列表');
                // TODO: 显示Computer Use列表
                break;
            default:
                console.log('未知分类:', category);
        }

        // 触发自定义事件
        if (typeof window.eventBus !== 'undefined') {
            window.eventBus.emit('tools:category:changed', { category });
        }
    },

    destroy() {
        // 清理事件监听器
    }
};

export default toolsHandlers;

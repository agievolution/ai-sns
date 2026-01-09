/**
 * Tools Module - Index
 * 工具管理模块入口
 */

import ToolsPage from './ToolsPage.js';
import ToolsSidebar from './ToolsSidebar.js';
import toolsHandlers from './toolsHandlers.js';

export default {
    name: 'tools',
    version: '1.0.0',

    /**
     * 渲染主内容区
     */
    renderPage() {
        return ToolsPage.render();
    },

    /**
     * 渲染侧边栏
     */
    renderSidebar() {
        return ToolsSidebar.render();
    },

    /**
     * 初始化模块
     */
    init() {
        toolsHandlers.init();
    },

    /**
     * 销毁模块
     */
    destroy() {
        toolsHandlers.destroy();
    }
};

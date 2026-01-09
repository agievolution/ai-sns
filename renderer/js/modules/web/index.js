/**
 * Web Module - Index
 * Web服务模块入口
 */

import WebPage from './WebPage.js';
import WebSidebar from './WebSidebar.js';
import webHandlers from './webHandlers.js';

export default {
    name: 'web',
    version: '1.0.0',

    /**
     * 渲染主内容区
     */
    renderPage() {
        return WebPage.render();
    },

    /**
     * 渲染侧边栏
     */
    renderSidebar() {
        return WebSidebar.render();
    },

    /**
     * 初始化模块
     */
    init() {
        webHandlers.init();
    },

    /**
     * 销毁模块
     */
    destroy() {
        webHandlers.destroy();
    }
};

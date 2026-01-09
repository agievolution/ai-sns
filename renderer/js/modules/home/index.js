/**
 * Home Module - Index
 * 首页模块入口
 */

import HomePage from './HomePage.js';
import HomeSidebar from './HomeSidebar.js';
import homeHandlers from './homeHandlers.js';

export default {
    name: 'home',
    version: '1.0.0',

    /**
     * 渲染主内容区
     */
    renderPage() {
        return HomePage.render();
    },

    /**
     * 渲染侧边栏
     */
    renderSidebar() {
        return HomeSidebar.render();
    },

    /**
     * 初始化模块
     */
    init() {
        homeHandlers.init();
    },

    /**
     * 销毁模块
     */
    destroy() {
        homeHandlers.destroy();
    }
};

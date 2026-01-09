/**
 * Module Loader - 加载所有模块
 * 这个文件负责导入和注册所有模块到 router
 */

// 导入所有模块（注意：需要在HTML中设置 type="module"）
import homeModule from './modules/home/index.js';
import snsModule from './modules/sns/index.js';
import agentModule from './modules/agent/index.js';
import kmModule from './modules/km/index.js';
import toolsModule from './modules/tools/index.js';
import webModule from './modules/web/index.js';

/**
 * 初始化并注册所有模块
 */
function initializeModules() {
    if (!window.router) {
        console.error('Router not initialized');
        return false;
    }

    // 注册所有模块
    const modules = [
        { name: 'home', module: homeModule },
        { name: 'sns', module: snsModule },
        { name: 'agent', module: agentModule },
        { name: 'km', module: kmModule },
        { name: 'tools', module: toolsModule },
        { name: 'web', module: webModule }
    ];

    modules.forEach(({ name, module }) => {
        const success = window.router.register(name, module);
        if (success) {
            console.log(`✓ Module '${name}' registered successfully`);
        } else {
            console.error(`✗ Failed to register module '${name}'`);
        }
    });

    return true;
}

// 导出初始化函数
window.initializeModules = initializeModules;

// 如果在浏览器环境中，自动初始化
if (typeof window !== 'undefined') {
    // 等待 router 就绪后初始化
    if (window.router) {
        initializeModules();
    } else {
        // 如果 router 还未加载，等待 DOMContentLoaded 事件
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeModules, 100);
        });
    }
}

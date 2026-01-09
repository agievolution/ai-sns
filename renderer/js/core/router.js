/**
 * Router - 路由管理
 * 负责页面导航和模块加载
 */

class Router {
    constructor() {
        this.currentPage = null;
        this.modules = {};
        this.initialized = false;
    }

    /**
     * 注册模块
     * @param {string} name - 模块名称
     * @param {Object} module - 模块对象
     */
    register(name, module) {
        if (!module.renderPage || !module.renderSidebar || !module.init) {
            console.error(`Module '${name}' missing required methods`);
            return false;
        }
        this.modules[name] = module;
        return true;
    }

    /**
     * 导航到指定页面
     * @param {string} page - 页面名称
     */
    navigateTo(page) {
        if (this.currentPage === page) {
            console.log(`Already on page '${page}'`);
            return;
        }

        if (!this.modules[page]) {
            console.error(`Module '${page}' not found`);
            return;
        }

        console.log(`Navigating to: ${page}`);

        // 隐藏当前页面
        if (this.currentPage) {
            const currentPageElement = document.getElementById(`page-${this.currentPage}`);
            if (currentPageElement) {
                currentPageElement.classList.add('hidden');
            }

            // 调用当前模块的 destroy 方法（如果有）
            const currentModule = this.modules[this.currentPage];
            if (currentModule.destroy) {
                try {
                    currentModule.destroy();
                } catch (error) {
                    console.error(`Error destroying module '${this.currentPage}':`, error);
                }
            }
        }

        this.currentPage = page;

        // 更新导航栏状态
        document.querySelectorAll('.nav-icon-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // 渲染侧边栏
        this.renderSidebar(page);

        // 渲染或显示主内容区
        this.renderOrShowMainContent(page);

        // 触发导航事件
        if (window.eventBus) {
            window.eventBus.emit('page:changed', { from: this.currentPage, to: page });
        }
    }

    /**
     * 渲染侧边栏
     * @param {string} page - 页面名称
     */
    renderSidebar(page) {
        const sidebar = document.getElementById('secondarySidebar');
        if (!sidebar) return;

        const module = this.modules[page];
        if (!module) return;

        try {
            const sidebarContent = module.renderSidebar();
            sidebar.innerHTML = sidebarContent;
        } catch (error) {
            console.error(`Error rendering sidebar for '${page}':`, error);
            sidebar.innerHTML = '<p style="padding: 20px; color: #999;">侧边栏加载失败</p>';
        }
    }

    /**
     * 渲染或显示主内容区
     * @param {string} page - 页面名称
     */
    renderOrShowMainContent(page) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        const module = this.modules[page];
        if (!module) return;

        // 检查页面是否已渲染
        let pageElement = document.getElementById(`page-${page}`);

        if (!pageElement) {
            // 页面未渲染，创建新的页面容器
            pageElement = document.createElement('div');
            pageElement.id = `page-${page}`;
            pageElement.className = 'page-container';

            try {
                const pageContent = module.renderPage();
                pageElement.innerHTML = pageContent;
                mainContent.appendChild(pageElement);

                // 初始化模块
                if (module.init) {
                    module.init();
                }
                pageElement.dataset.initialized = 'true';
            } catch (error) {
                console.error(`Error rendering page '${page}':`, error);
                pageElement.innerHTML = '<p style="padding: 20px; color: #999;">页面加载失败</p>';
            }
        } else {
            // 页面已渲染，直接显示
            pageElement.classList.remove('hidden');
        }
    }

    /**
     * 获取当前页面
     * @returns {string|null}
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 重新加载当前页面
     */
    reload() {
        if (!this.currentPage) return;

        const pageElement = document.getElementById(`page-${this.currentPage}`);
        if (pageElement) {
            pageElement.remove();
        }

        const page = this.currentPage;
        this.currentPage = null;
        this.navigateTo(page);
    }
}

// 导出单例
const router = new Router();
window.router = router;

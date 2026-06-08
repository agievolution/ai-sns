/**
 * Router - Routing Management
 * Responsible for page navigation and module loading
 */


class Router {
    constructor() {
        this.currentPage = null;
        this.modules = {};
        this.initialized = false;
    }

    /**
     * Register a module
     * @param {string} name - Module name
     * @param {Object} module - Module object
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
     * Navigate to a specific page
     * @param {string} page - Page name
     */
    async navigateTo(page) {

        const existingCurrentPageElement = document.getElementById(`page-${page}`);
        if (this.currentPage === page && existingCurrentPageElement && existingCurrentPageElement.dataset.initialized === 'true') {
            console.log(`Already on page '${page}'`);
            return;
        }

        if (!this.modules[page]) {
            console.error(`Module '${page}' not found`);
            return;
        }

        console.log(`Navigating to: ${page}`);

        // Save old page for event emitting
        const oldPage = this.currentPage;

        // Hide Agent management pages (if open)
        const modelMgmtPage = document.querySelector('.model-management-page-container');
        const roleMgmtPage = document.querySelector('.role-management-page-container');

        if (modelMgmtPage) {
            modelMgmtPage.style.display = 'none';
        }
        if (roleMgmtPage) {
            roleMgmtPage.style.display = 'none';
        }

        // Hide current page (preserve state; do not call destroy)
        if (this.currentPage) {
            const currentPageElement = document.getElementById(`page-${this.currentPage}`);
            if (currentPageElement) {
                currentPageElement.classList.add('hidden');
            }

            // Note: do not call destroy() anymore to preserve module state
            // If cleanup is needed, it should be tied to app-exit events rather than page switching
        }

        this.currentPage = page;

        // Update navbar state
        document.querySelectorAll('.nav-icon-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Render sidebar (await async completion)
        await this.renderSidebar(page);

        // Render or show main content (await so the initial landing page's
        // data load completes before navigation resolves; the startup
        // bootstrap relies on this to hide the global loading overlay only
        // after the first module is fully initialized).
        await this.renderOrShowMainContent(page);

        // Emit navigation event
        if (window.eventBus) {
            window.eventBus.emit('page:changed', { from: oldPage, to: page });
        }
    }

    /**
     * Render sidebar (state-preserving version)
     * @param {string} page - Page name
     */
    async renderSidebar(page) {

        const sidebarContainer = document.getElementById('secondarySidebar');
        if (!sidebarContainer) return;

        const module = this.modules[page];
        if (!module) return;

        try {
            // Hide all sidebar containers
            const allSidebars = sidebarContainer.querySelectorAll('.sidebar-page-container');
            allSidebars.forEach(sb => sb.classList.add('hidden'));

            // Check if sidebar container for this page already exists
            let pageSidebar = sidebarContainer.querySelector(`#sidebar-${page}`);

            if (!pageSidebar) {
                // First render: create a new sidebar container
                pageSidebar = document.createElement('div');
                pageSidebar.id = `sidebar-${page}`;
                pageSidebar.className = 'sidebar-page-container';

                const sidebarContent = module.renderSidebar();
                pageSidebar.innerHTML = sidebarContent;
                sidebarContainer.appendChild(pageSidebar);

                // Note: Agent sidebar initialization is handled by multiAgentHandlers.init()
                // which is called from module.init() in renderOrShowMainContent().
                // This avoids duplicate AgentSidebar.init() calls and ensures
                // the sidebar is initialized AFTER AgentPage creates page DOM.

                pageSidebar.dataset.initialized = 'true';
                console.log(`[Router] Sidebar rendered for the first time: ${page}`);
            } else {
                // Already exists: show directly
                pageSidebar.classList.remove('hidden');
                console.log(`[Router] Sidebar restored (preserving state): ${page}`);

                // Special case: when restoring Agent page, ensure UI state is synced
                if (page === 'agent' && window.AgentSidebar && typeof window.AgentSidebar.restoreAfterPageSwitch === 'function') {
                    setTimeout(() => {
                        window.AgentSidebar.restoreAfterPageSwitch();
                    }, 50);
                }
            }
        } catch (error) {
            console.error(`Error rendering sidebar for '${page}':`, error);
            // Create error placeholder container
            const errorSidebar = document.createElement('div');
            errorSidebar.id = `sidebar-${page}`;
            errorSidebar.className = 'sidebar-page-container';
            errorSidebar.innerHTML = '<p style="padding: 20px; color: #999;">Sidebar loading failed</p>';
            sidebarContainer.appendChild(errorSidebar);
        }
    }

    /**
     * Render or show main content
     * @param {string} page - Page name
     */
    async renderOrShowMainContent(page) {

        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        const module = this.modules[page];
        if (!module) return;

        // Check if the page has been rendered
        let pageElement = document.getElementById(`page-${page}`);

        if (!pageElement) {
            // Page not rendered yet; create a new page container
            pageElement = document.createElement('div');
            pageElement.id = `page-${page}`;
            pageElement.className = 'page-container';

            try {
                const pageContent = module.renderPage();
                pageElement.innerHTML = pageContent;
                mainContent.appendChild(pageElement);

                // Initialize module. Await so that initial-page data load
                // completes before navigateTo resolves; this lets the
                // startup bootstrap hide the loading overlay only after
                // the first page is fully ready.
                if (module.init) {
                    await module.init();
                }
                pageElement.dataset.initialized = 'true';
            } catch (error) {
                console.error(`Error rendering page '${page}':`, error);
                pageElement.innerHTML = '<p style="padding: 20px; color: #999;">Page loading failed</p>';
            }
        } else {
            // Page already rendered; show directly (preserve all state)
            pageElement.classList.remove('hidden');
            // Clear any display:none set by management pages
            pageElement.style.display = '';
            console.log(`[Router] Page restored (preserving state): ${page}`);
        }
    }

    /**
     * Get current page
     * @returns {string|null}
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Reload current page
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

// Export singleton
const router = new Router();
window.router = router;
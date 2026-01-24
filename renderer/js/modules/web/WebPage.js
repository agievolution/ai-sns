/**
 * Web Page - 主内容渲染
 */

const WebPage = {
    currentUrl: null,

    render() {
        return `
            <div class="web-page">
                <div class="web-content-wrapper">
                    <div class="web-empty-state" id="webEmptyState">
                        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        <h3>Web Services</h3>
                        <p>Click on any LLM or AI Tool icon to open it here</p>
                        <p style="font-size: 0.75rem; margin-top: 1rem; opacity: 0.6;">
                            💡 Tip: Right-click on any icon for more options
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    async loadUrl(url) {
        if (window.electronAPI && window.electronAPI.loadUrlInBrowserView) {
            try {
                const result = await window.electronAPI.loadUrlInBrowserView(url);
                if (result.success) {
                    this.currentUrl = url;
                    const emptyState = document.getElementById('webEmptyState');
                    if (emptyState) {
                        emptyState.style.display = 'none';
                    }
                } else {
                    console.error('Failed to load URL:', result.error);
                }
            } catch (error) {
                console.error('Error loading URL in BrowserView:', error);
            }
        }
    },

    closeBrowserView() {
        if (window.electronAPI && window.electronAPI.closeBrowserView) {
            window.electronAPI.closeBrowserView();
            this.currentUrl = null;
            const emptyState = document.getElementById('webEmptyState');
            if (emptyState) {
                emptyState.style.display = 'flex';
            }
        }
    },

    openInBrowser(url) {
        if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
    }
};

export default WebPage;

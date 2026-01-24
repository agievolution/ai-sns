/**
 * KM Page - File Search (kmtype=0)
 */

const KMFilePage = {
    render(kbId) {
        return `
            <div class="km-page-layout">
                <div class="km-file-container" style="display: flex; gap: 20px; height: 100%;">
                    <!-- Left: File List -->
                    <div class="km-file-list-panel" style="width: 300px; border-right: 1px solid #e0e0e0; padding-right: 20px;">
                        <div class="km-file-list-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0;">Files</h3>
                            <button class="btn-primary btn-sm" id="fileAddBtn-${kbId}" style="padding: 6px 12px; font-size: 13px;">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: middle; margin-right: 4px;">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                                Add
                            </button>
                        </div>
                        <div class="km-file-list" id="fileTree-${kbId}" style="overflow-y: auto; max-height: calc(100vh - 200px);">
                            <div class="km-file-loading">Loading files...</div>
                        </div>
                    </div>

                    <!-- Right: Vector Search Area -->
                    <div class="km-search-area" style="flex: 1;">
                        <div class="km-search-header">
                            <h3>Vector Search</h3>
                            <p>Search through uploaded documents using semantic search</p>
                        </div>
                        <div class="km-search-input-area">
                            <input type="text" id="vectorSearchInput-${kbId}" class="km-search-input-large" placeholder="Enter your search query...">
                            <button class="km-search-btn" id="vectorSearchBtn-${kbId}">Search</button>
                        </div>
                        <div class="km-search-results" id="searchResults-${kbId}">
                            <div class="empty-state">Enter a query to search through your documents</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Bind search button events
        document.querySelectorAll('[id^="vectorSearchBtn-"]').forEach(btn => {
            const kbId = btn.id.replace('vectorSearchBtn-', '');
            btn.addEventListener('click', () => {
                if (window.kmHandlers) {
                    window.kmHandlers.performVectorSearch(parseInt(kbId));
                }
            });
        });

        // Bind Enter key to search
        document.querySelectorAll('[id^="vectorSearchInput-"]').forEach(input => {
            const kbId = input.id.replace('vectorSearchInput-', '');
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && window.kmHandlers) {
                    window.kmHandlers.performVectorSearch(parseInt(kbId));
                }
            });
        });

        // Bind file add button
        document.querySelectorAll('[id^="fileAddBtn-"]').forEach(btn => {
            const kbId = btn.id.replace('fileAddBtn-', '');
            btn.addEventListener('click', () => {
                if (window.kmHandlers) {
                    window.kmHandlers.showAddFileDialog(parseInt(kbId));
                }
            });
        });

        console.log('[KMFilePage] Initialized');
    },

    destroy() {
        // Clean up event listeners if needed
    }
};

export default KMFilePage;

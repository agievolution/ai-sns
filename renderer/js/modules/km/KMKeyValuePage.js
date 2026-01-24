/**
 * KM Page - Key-Value Editor (kmtype=2)
 */

const KMKeyValuePage = {
    render(kbId) {
        return `
            <div class="km-page-layout">
                <!-- Search Bar -->
                <div class="km-search-bar">
                    <div class="km-search-input-wrapper">
                        <svg class="km-search-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        <input type="text" class="km-search-input" id="kvSearchInput" placeholder="Search by key or value...">
                        <button class="km-search-clear" id="clearKvSearchBtn" style="display: none;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="km-kv-container">
                    <!-- Left: KV List -->
                    <div class="km-kv-list-panel">
                        <div class="km-kv-list-header">
                            <h3>Key-Value Pairs</h3>
                            <button class="btn-primary btn-sm" id="kvNewBtn">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                                New
                            </button>
                        </div>
                        <div class="km-kv-list" id="kvTree-${kbId}">
                            <div class="km-kv-loading">Loading...</div>
                        </div>
                    </div>

                    <!-- Right: KV Editor -->
                    <div class="km-kv-editor-panel">
                        <div class="km-kv-editor-header">
                            <h3 id="kvEditorTitle">New Key-Value Pair</h3>
                        </div>
                        <div class="km-kv-form">
                            <div class="form-group">
                                <label>Key</label>
                                <input type="text" id="kvKeyInput" class="form-input" placeholder="Enter key">
                            </div>
                            <div class="form-group">
                                <label>Value</label>
                                <textarea id="kvValueInput" class="form-textarea" rows="15" placeholder="Enter value (supports JSON, text, etc.)"></textarea>
                            </div>
                            <div class="form-actions">
                                <button class="btn-primary" id="kvSaveBtn-${kbId}">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                                    </svg>
                                    Save
                                </button>
                                <button class="btn-secondary" id="kvClearBtn">Clear</button>
                                <button class="btn-danger" id="kvDeleteBtn" style="display: none;">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.bindSearchEvents();
        this.bindFormEvents();
        this.bindListEvents();
        console.log('[KMKeyValuePage] Initialized');
    },

    bindSearchEvents() {
        const searchInput = document.getElementById('kvSearchInput');
        const clearBtn = document.getElementById('clearKvSearchBtn');

        if (!searchInput || !clearBtn) return;

        searchInput.addEventListener('input', (e) => {
            clearBtn.style.display = e.target.value ? 'flex' : 'none';
            this.filterKVList(e.target.value);
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            this.filterKVList('');
        });
    },

    bindFormEvents() {
        // Save button
        document.querySelectorAll('[id^="kvSaveBtn-"]').forEach(btn => {
            const kbId = btn.id.replace('kvSaveBtn-', '');
            btn.addEventListener('click', () => {
                if (window.kmHandlers) {
                    window.kmHandlers.saveCurrentKV(parseInt(kbId));
                }
            });
        });

        // Clear button
        const clearBtn = document.getElementById('kvClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (window.kmHandlers) {
                    window.kmHandlers.clearKVForm();
                }
            });
        }

        // Delete button
        const deleteBtn = document.getElementById('kvDeleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (window.kmHandlers && window.kmHandlers.currentKVId) {
                    window.kmHandlers.deleteCurrentKV();
                }
            });
        }

        // New button
        const newBtn = document.getElementById('kvNewBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                if (window.kmHandlers) {
                    window.kmHandlers.clearKVForm();
                }
            });
        }

        // Ctrl+S to save
        const kvValueInput = document.getElementById('kvValueInput');
        if (kvValueInput) {
            kvValueInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    const saveBtn = document.querySelector('[id^="kvSaveBtn-"]');
                    if (saveBtn && window.kmHandlers) {
                        const kbId = saveBtn.id.replace('kvSaveBtn-', '');
                        window.kmHandlers.saveCurrentKV(parseInt(kbId));
                    }
                }
            });
        }
    },

    bindListEvents() {
        // Event delegation for KV list items
        const kvLists = document.querySelectorAll('[id^="kvTree-"]');
        kvLists.forEach(list => {
            list.addEventListener('click', (e) => {
                const kvItem = e.target.closest('.km-tree-item');
                if (kvItem && window.kmHandlers) {
                    const kvId = parseInt(kvItem.dataset.kvId);
                    const kbId = parseInt(kvItem.dataset.kbId);
                    window.kmHandlers.openKeyValue(kbId, kvId);
                }
            });
        });
    },

    filterKVList(query) {
        const items = document.querySelectorAll('.km-tree-item[data-kv-id]');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const key = item.querySelector('.tree-text')?.textContent.toLowerCase() || '';

            if (key.includes(lowerQuery)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    },

    destroy() {
        // Clean up event listeners if needed
    }
};

export default KMKeyValuePage;

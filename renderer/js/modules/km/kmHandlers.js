/**
 * KM Handlers - Multi-KB event handling for all KB types
 */

import Toast from '../../utils/toast.js';
import KMNotePage from './KMNotePage.js';
import KMFilePage from './KMFilePage.js';
import KMKeyValuePage from './KMKeyValuePage.js';

const kmHandlers = {
    currentKbId: null,
    currentKmId: null,  // String km_id like "note_store"
    currentKbType: null,
    currentNoteId: null,
    currentFileId: null,
    currentKvId: null,
    notes: {},
    files: {},
    keyValues: {},

    init() {
        this.bindGlobalEvents();
    },

    bindGlobalEvents() {
        // Listen for KB switch events
        window.addEventListener('km-switched', async (e) => {
            const { kbId, kmId, kbType } = e.detail;
            this.currentKbId = kbId;
            this.currentKmId = kmId;  // Store string km_id
            this.currentKbType = kbType;
            console.log('[kmHandlers] KB switched to:', kbId, 'kmId:', kmId, 'type:', kbType);

            // Initialize the appropriate page based on KB type
            await this.initializePage(kbId, kmId, kbType);
        });

        // Listen for new note events
        window.addEventListener('km-new-note', (e) => {
            const { kbId } = e.detail;
            this.createNewNote(kbId);
        });

        // Listen for add file events
        window.addEventListener('km-add-file', (e) => {
            const { kbId } = e.detail;
            this.showAddFileDialog(kbId);
        });

        // Listen for add key-value events
        window.addEventListener('km-add-kv', (e) => {
            const { kbId } = e.detail;
            this.showAddKVDialog(kbId);
        });
    },

    /**
     * Initialize the appropriate page based on KB type
     */
    async initializePage(kbId, kmId, kbType) {
        console.log(`[kmHandlers] Initializing page for KB ${kbId} (kmId: ${kmId}, type: ${kbType})`);

        // Get main content container
        const mainContent = document.getElementById('km-main-content');
        if (!mainContent) {
            console.error('[kmHandlers] Main content container not found');
            return;
        }

        // Render appropriate page HTML based on KB type
        let pageHTML = '';
        if (kbType === 1) {
            // Note type
            pageHTML = KMNotePage.render();
        } else if (kbType === 0) {
            // File type
            pageHTML = KMFilePage.render();
        } else if (kbType === 2) {
            // Key-value type
            pageHTML = KMKeyValuePage.render();
        } else {
            pageHTML = '<div class="km-empty-state"><p style="text-align: center; color: #999; padding: 40px;">Unknown KB type</p></div>';
        }

        // Replace main content with new page
        mainContent.innerHTML = pageHTML;
        console.log('[kmHandlers] Rendered page HTML for type:', kbType);

        // Initialize the editor/page based on KB type
        setTimeout(() => {
            try {
                if (kbType === 1) {
                    // Note type - initialize note editor
                    if (KMNotePage && typeof KMNotePage.init === 'function') {
                        KMNotePage.init();
                        console.log('[kmHandlers] KMNotePage initialized');
                    }
                } else if (kbType === 0) {
                    // File type - initialize file page
                    if (KMFilePage && typeof KMFilePage.init === 'function') {
                        KMFilePage.init();
                        console.log('[kmHandlers] KMFilePage initialized');
                    }
                } else if (kbType === 2) {
                    // Key-value type - initialize KV page
                    if (KMKeyValuePage && typeof KMKeyValuePage.init === 'function') {
                        KMKeyValuePage.init();
                        console.log('[kmHandlers] KMKeyValuePage initialized');
                    }
                }
            } catch (error) {
                console.error('[kmHandlers] Error initializing page:', error);
            }
        }, 100); // Small delay to ensure DOM is ready

        // Load data based on KB type (use kmId for filtering)
        try {
            if (kbType === 1) {
                // Load notes - use kmId for filtering
                await this.loadNotesForKb(kbId, kmId);
            } else if (kbType === 0) {
                // Load files
                await this.loadFilesForKb(kbId);
            } else if (kbType === 2) {
                // Load key-values
                await this.loadKeyValuesForKb(kbId);
            }
        } catch (error) {
            console.error('[kmHandlers] Error loading KB data:', error);
            Toast.error('Failed to load knowledge base data');
        }
    },

    /**
     * Load notes for a specific KB (kmtype=1)
     */
    async loadNotesForKb(kbId, kmId) {
        const noteTree = document.getElementById(`noteTree-${kbId}`);
        if (!noteTree) {
            console.warn(`[kmHandlers] noteTree-${kbId} not found`);
            return;
        }

        const loading = Toast.loading('Loading notes...');

        try {
            // Use the search endpoint with kmId parameter (no query means get all notes for this KB)
            const url = `http://localhost:8788/api/km/notes/search?km_id=${encodeURIComponent(kmId)}`;
            console.log('[kmHandlers] Loading notes from:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const notes = await response.json();  // API returns array directly
            console.log(`[kmHandlers] Loaded ${notes.length} notes for kmId:`, kmId);

            this.notes[kbId] = Array.isArray(notes) ? notes : [];
            this.renderNoteList(kbId);
            this.bindNoteListEvents(kbId);
            loading.close();
        } catch (error) {
            console.error('[kmHandlers] Error loading notes:', error);
            loading.close();
            Toast.error('Failed to load notes');
            noteTree.innerHTML = '<div style="padding: 20px; color: #999;">Failed to load notes</div>';
        }
    },

    renderNoteList(kbId) {
        const noteTree = document.getElementById(`noteTree-${kbId}`);
        if (!noteTree) return;

        const notes = this.notes[kbId] || [];

        if (notes.length === 0) {
            noteTree.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    No notes<br>
                    Click "New Note" to create
                </div>
            `;
            return;
        }

        const sortedNotes = [...notes].sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) {
                return a.is_pinned ? -1 : 1;
            }
            return new Date(b.updated_at || b.create_time) - new Date(a.updated_at || a.create_time);
        });

        const html = sortedNotes.map(note => {
            const isPinned = note.is_pinned ? '<span style="color: #ff9800; margin-left: 5px;">📌</span>' : '';
            return `
                <div class="km-tree-item ${this.currentNoteId === note.id ? 'active' : ''}"
                     data-note-id="${note.id}" data-kb-id="${kbId}">
                    <span class="tree-icon">📄</span>
                    <span class="tree-text">${this.escapeHtml(note.title)}${isPinned}</span>
                </div>
            `;
        }).join('');

        noteTree.innerHTML = html;
    },

    bindNoteListEvents(kbId) {
        const noteTree = document.getElementById(`noteTree-${kbId}`);
        if (!noteTree) return;

        noteTree.addEventListener('click', (e) => {
            const item = e.target.closest('.km-tree-item[data-note-id]');
            if (item) {
                const noteId = parseInt(item.dataset.noteId);
                this.openNote(kbId, noteId);
            }
        });

        noteTree.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.km-tree-item[data-note-id]');
            if (item) {
                e.preventDefault();
                const noteId = parseInt(item.dataset.noteId);
                this.showNoteContextMenu(e, kbId, noteId);
            }
        });

        // Bind search input
        const searchInput = document.querySelector(`.km-user-section[data-kb-id="${kbId}"] .search-input`);
        if (searchInput) {
            searchInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    await this.searchNotesInKb(kbId, query);
                }
            });
        }
    },

    /**
     * Search notes in a KB
     */
    async searchNotesInKb(kbId, query) {
        const noteTree = document.getElementById(`noteTree-${kbId}`);
        if (!noteTree) return;

        // Get string km_id from data attribute
        const kmId = noteTree.dataset.kmId;
        if (!kmId) {
            console.error('No kmId found for noteTree');
            return;
        }

        const loading = Toast.loading(query ? 'Searching notes...' : 'Loading all notes...');

        try {
            let url = `http://localhost:8788/api/km/notes/search?km_id=${encodeURIComponent(kmId)}`;
            if (query) {
                url += `&query=${encodeURIComponent(query)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to search notes');
            }

            const notes = await response.json();
            this.notes[kbId] = Array.isArray(notes) ? notes : [];
            this.renderNoteList(kbId);
            this.bindNoteListEvents(kbId);
            loading.close();

            if (query) {
                Toast.success(`Found ${this.notes[kbId].length} notes`);
            }
        } catch (error) {
            console.error('Error searching notes:', error);
            loading.close();
            Toast.error('Failed to search notes');
            noteTree.innerHTML = '<div style="padding: 20px; color: #999;">Failed to search notes</div>';
        }
    },

    async openNote(kbId, noteId) {
        const notes = this.notes[kbId] || [];
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const noteContent = document.getElementById('noteContent');
        if (noteContent) {
            let content = note.content || '<p></p>';

            // Normalize content: if it's plain text without HTML tags, wrap it in <p>
            if (content && !content.trim().startsWith('<')) {
                content = `<p>${content}</p>`;
            }

            noteContent.innerHTML = content;
            noteContent.focus();
        }

        this.currentNoteId = noteId;
        this.currentKbId = kbId;

        document.querySelectorAll(`#noteTree-${kbId} .km-tree-item`).forEach(i => i.classList.remove('active'));
        const activeItem = document.querySelector(`#noteTree-${kbId} .km-tree-item[data-note-id="${noteId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    },

    createNewNote(kbId) {
        const noteContent = document.getElementById('noteContent');
        if (noteContent) {
            noteContent.innerHTML = '<p></p>';
            noteContent.focus();
        }

        this.currentNoteId = null;
        this.currentKbId = kbId;

        document.querySelectorAll(`#noteTree-${kbId} .km-tree-item`).forEach(item => {
            item.classList.remove('active');
        });
    },

    async saveNote() {
        if (!this.currentKbId || !this.currentKmId) {
            console.error('No KB selected');
            Toast.error('Please select a knowledge base first');
            return;
        }

        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;

        const content = noteContent.innerHTML.trim();
        if (!content || content === '<p></p>' || content === '<p><br></p>') {
            Toast.warning('Note content cannot be empty');
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        let title = plainText.substring(0, 20).trim();
        if (plainText.length > 20) title += '...';
        if (!title) title = 'Untitled Note';

        const loading = Toast.loading('Saving note...');

        try {
            let savedNote;
            if (this.currentNoteId) {
                // Update existing note
                const response = await fetch(`http://localhost:8788/api/km/notes/${this.currentNoteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
                if (!response.ok) throw new Error('Save failed');
                savedNote = await response.json();
            } else {
                // Create new note - use string km_id
                const response = await fetch('http://localhost:8788/api/km/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        content,
                        km_id: this.currentKmId,  // Use string km_id
                        tags: []
                    })
                });
                if (!response.ok) throw new Error('Save failed');
                savedNote = await response.json();
                this.currentNoteId = savedNote.id;
            }

            // Reload notes list with both kbId and kmId
            await this.loadNotesForKb(this.currentKbId, this.currentKmId);
            loading.close();
            Toast.success('Note saved successfully');
        } catch (error) {
            console.error('Save note failed:', error);
            loading.close();
            Toast.error('Save failed: ' + error.message);
        }
    },

    showNoteContextMenu(event, kbId, noteId) {
        const notes = this.notes[kbId] || [];
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const existingMenu = document.querySelector('.note-context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'note-context-menu';
        menu.style.cssText = `
            position: fixed; left: ${event.clientX}px; top: ${event.clientY}px;
            background: white; border: 1px solid #ddd; border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10001;
            min-width: 160px; padding: 6px 0;
        `;

        menu.innerHTML = `
            <div class="context-menu-item" data-action="delete" style="color: #f44336; padding: 10px 16px; cursor: pointer;">
                Delete
            </div>
        `;

        document.body.appendChild(menu);

        menu.addEventListener('click', async (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item) return;

            if (item.dataset.action === 'delete') {
                const confirmed = await Toast.confirm(`Delete note "${note.title}"?`, {
                    title: 'Delete Note',
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                    type: 'warning'
                });

                if (confirmed) {
                    try {
                        const response = await fetch(`http://localhost:8788/api/km/notes/${noteId}`, {
                            method: 'DELETE'
                        });
                        if (!response.ok) throw new Error('Delete failed');

                        this.notes[kbId] = this.notes[kbId].filter(n => n.id !== noteId);
                        if (this.currentNoteId === noteId) {
                            const noteContent = document.getElementById('noteContent');
                            if (noteContent) noteContent.innerHTML = '<p></p>';
                            this.currentNoteId = null;
                        }
                        this.renderNoteList(kbId);
                        this.bindNoteListEvents(kbId);
                        Toast.success('Note deleted successfully');
                    } catch (error) {
                        console.error('Delete failed:', error);
                        Toast.error('Delete failed: ' + error.message);
                    }
                }
            }
            menu.remove();
        });

        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    },

    /**
     * Load files for a specific KB (kmtype=0)
     */
    async loadFilesForKb(kbId) {
        const fileTree = document.getElementById(`fileTree-${kbId}`);
        if (!fileTree) return;

        const loading = Toast.loading('Loading files...');

        try {
            const response = await fetch(`http://localhost:8788/api/km/${kbId}/files`);
            if (!response.ok) throw new Error('Failed to load files');

            const result = await response.json();
            this.files[kbId] = result.data || [];
            this.renderFileList(kbId);
            this.bindFileListEvents(kbId);
            loading.close();
        } catch (error) {
            console.error('Error loading files:', error);
            loading.close();
            Toast.error('Failed to load files');
            fileTree.innerHTML = '<div style="padding: 20px; color: #999;">Failed to load files</div>';
        }
    },

    renderFileList(kbId) {
        const fileTree = document.getElementById(`fileTree-${kbId}`);
        if (!fileTree) return;

        const files = this.files[kbId] || [];

        if (files.length === 0) {
            fileTree.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    No files<br>
                    Click "Add File" to upload
                </div>
            `;
            return;
        }

        const html = files.map(file => `
            <div class="km-tree-item" data-file-id="${file.id}" data-kb-id="${kbId}">
                <span class="tree-icon">📄</span>
                <span class="tree-text">${this.escapeHtml(file.filename)}</span>
            </div>
        `).join('');

        fileTree.innerHTML = html;
    },

    bindFileListEvents(kbId) {
        const fileTree = document.getElementById(`fileTree-${kbId}`);
        if (!fileTree) return;

        fileTree.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.km-tree-item[data-file-id]');
            if (item) {
                e.preventDefault();
                const fileId = parseInt(item.dataset.fileId);
                this.showFileContextMenu(e, kbId, fileId);
            }
        });
    },

    showFileContextMenu(event, kbId, fileId) {
        const files = this.files[kbId] || [];
        const file = files.find(f => f.id === fileId);
        if (!file) return;

        const existingMenu = document.querySelector('.file-context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'file-context-menu';
        menu.style.cssText = `
            position: fixed; left: ${event.clientX}px; top: ${event.clientY}px;
            background: white; border: 1px solid #ddd; border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10001;
            min-width: 160px; padding: 6px 0;
        `;

        menu.innerHTML = `
            <div class="context-menu-item" data-action="delete" style="color: #f44336; padding: 10px 16px; cursor: pointer;">
                Delete
            </div>
        `;

        document.body.appendChild(menu);

        menu.addEventListener('click', async (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item) return;

            if (item.dataset.action === 'delete') {
                const confirmed = await Toast.confirm(`Delete file "${file.filename}"?`, {
                    title: 'Delete File',
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                    type: 'warning'
                });

                if (confirmed) {
                    try {
                        const response = await fetch(`http://localhost:8788/api/km/${kbId}/files/${fileId}`, {
                            method: 'DELETE'
                        });
                        if (!response.ok) throw new Error('Delete failed');

                        this.files[kbId] = this.files[kbId].filter(f => f.id !== fileId);
                        this.renderFileList(kbId);
                        this.bindFileListEvents(kbId);
                        Toast.success('File deleted successfully');
                    } catch (error) {
                        console.error('Delete failed:', error);
                        Toast.error('Delete failed: ' + error.message);
                    }
                }
            }
            menu.remove();
        });

        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    },

    showAddFileDialog(kbId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.doc,.docx,.pdf,.ppt,.pptx,.txt,.xls,.xlsx';
        input.multiple = true;

        input.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (files.length === 0) return;

            for (const file of files) {
                await this.uploadFile(kbId, file);
            }

            await this.loadFilesForKb(kbId);
        });

        input.click();
    },

    async uploadFile(kbId, file) {
        const loading = Toast.loading(`Uploading ${file.name}...`);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('km_id', kbId);

        try {
            const response = await fetch(`http://localhost:8788/api/km/${kbId}/files`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            loading.close();
            Toast.success(`${file.name} uploaded successfully`);
            console.log('File uploaded:', file.name);
        } catch (error) {
            console.error('Upload failed:', error);
            loading.close();
            Toast.error(`Upload failed for ${file.name}: ${error.message}`);
        }
    },

    /**
     * Load key-values for a specific KB (kmtype=2)
     */
    async loadKeyValuesForKb(kbId) {
        const kvTree = document.getElementById(`kvTree-${kbId}`);
        if (!kvTree) return;

        const loading = Toast.loading('Loading key-values...');

        try {
            const response = await fetch(`http://localhost:8788/api/km/${kbId}/keyvalues`);
            if (!response.ok) throw new Error('Failed to load key-values');

            const result = await response.json();
            this.keyValues[kbId] = result.data || [];
            this.renderKeyValueList(kbId);
            this.bindKeyValueListEvents(kbId);
            loading.close();
        } catch (error) {
            console.error('Error loading key-values:', error);
            loading.close();
            Toast.error('Failed to load key-values');
            kvTree.innerHTML = '<div style="padding: 20px; color: #999;">Failed to load key-values</div>';
        }
    },

    renderKeyValueList(kbId) {
        const kvTree = document.getElementById(`kvTree-${kbId}`);
        if (!kvTree) return;

        const kvs = this.keyValues[kbId] || [];

        if (kvs.length === 0) {
            kvTree.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    No key-value pairs<br>
                    Click "Add" to create
                </div>
            `;
            return;
        }

        const html = kvs.map(kv => `
            <div class="km-tree-item ${this.currentKvId === kv.id ? 'active' : ''}"
                 data-kv-id="${kv.id}" data-kb-id="${kbId}">
                <span class="tree-icon">🔑</span>
                <span class="tree-text">${this.escapeHtml(kv.key)}</span>
            </div>
        `).join('');

        kvTree.innerHTML = html;
    },

    bindKeyValueListEvents(kbId) {
        const kvTree = document.getElementById(`kvTree-${kbId}`);
        if (!kvTree) return;

        kvTree.addEventListener('click', (e) => {
            const item = e.target.closest('.km-tree-item[data-kv-id]');
            if (item) {
                const kvId = parseInt(item.dataset.kvId);
                this.openKeyValue(kbId, kvId);
            }
        });

        kvTree.addEventListener('contextmenu', (e) => {
            const item = e.target.closest('.km-tree-item[data-kv-id]');
            if (item) {
                e.preventDefault();
                const kvId = parseInt(item.dataset.kvId);
                this.showKVContextMenu(e, kbId, kvId);
            }
        });
    },

    openKeyValue(kbId, kvId) {
        const kvs = this.keyValues[kbId] || [];
        const kv = kvs.find(k => k.id === kvId);
        if (!kv) return;

        const kvKeyInput = document.getElementById('kvKeyInput');
        const kvValueInput = document.getElementById('kvValueInput');

        if (kvKeyInput) kvKeyInput.value = kv.key;
        if (kvValueInput) kvValueInput.value = kv.value;

        this.currentKvId = kvId;
        this.currentKbId = kbId;

        document.querySelectorAll(`#kvTree-${kbId} .km-tree-item`).forEach(i => i.classList.remove('active'));
        const activeItem = document.querySelector(`#kvTree-${kbId} .km-tree-item[data-kv-id="${kvId}"]`);
        if (activeItem) activeItem.classList.add('active');
    },

    showAddKVDialog(kbId) {
        const key = prompt('Enter key:');
        if (!key) return;

        const value = prompt('Enter value:');
        if (value === null) return;

        this.saveKeyValue(kbId, null, key, value);
    },

    async saveKeyValue(kbId, kvId, key, value) {
        const loading = Toast.loading('Saving key-value...');

        try {
            let savedKv;
            if (kvId) {
                const response = await fetch(`http://localhost:8788/api/km/${kbId}/keyvalues/${kvId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value })
                });
                if (!response.ok) throw new Error('Save failed');
                const result = await response.json();
                savedKv = result.data;
            } else {
                const response = await fetch(`http://localhost:8788/api/km/${kbId}/keyvalues`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value, km_id: kbId })
                });
                if (!response.ok) throw new Error('Save failed');
                const result = await response.json();
                savedKv = result.data;
            }

            await this.loadKeyValuesForKb(kbId);
            loading.close();
            Toast.success('Key-value saved successfully');
        } catch (error) {
            console.error('Save key-value failed:', error);
            loading.close();
            Toast.error('Save failed: ' + error.message);
        }
    },

    showKVContextMenu(event, kbId, kvId) {
        const kvs = this.keyValues[kbId] || [];
        const kv = kvs.find(k => k.id === kvId);
        if (!kv) return;

        const existingMenu = document.querySelector('.kv-context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = 'kv-context-menu';
        menu.style.cssText = `
            position: fixed; left: ${event.clientX}px; top: ${event.clientY}px;
            background: white; border: 1px solid #ddd; border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10001;
            min-width: 160px; padding: 6px 0;
        `;

        menu.innerHTML = `
            <div class="context-menu-item" data-action="delete" style="color: #f44336; padding: 10px 16px; cursor: pointer;">
                Delete
            </div>
        `;

        document.body.appendChild(menu);

        menu.addEventListener('click', async (e) => {
            const item = e.target.closest('.context-menu-item');
            if (!item) return;

            if (item.dataset.action === 'delete') {
                const confirmed = await Toast.confirm(`Delete key-value "${kv.key}"?`, {
                    title: 'Delete Key-Value',
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                    type: 'warning'
                });

                if (confirmed) {
                    try {
                        const response = await fetch(`http://localhost:8788/api/km/${kbId}/keyvalues/${kvId}`, {
                            method: 'DELETE'
                        });
                        if (!response.ok) throw new Error('Delete failed');

                        this.keyValues[kbId] = this.keyValues[kbId].filter(k => k.id !== kvId);
                        if (this.currentKvId === kvId) {
                            const kvKeyInput = document.getElementById('kvKeyInput');
                            const kvValueInput = document.getElementById('kvValueInput');
                            if (kvKeyInput) kvKeyInput.value = '';
                            if (kvValueInput) kvValueInput.value = '';
                            this.currentKvId = null;
                        }
                        this.renderKeyValueList(kbId);
                        this.bindKeyValueListEvents(kbId);
                        Toast.success('Key-value deleted successfully');
                    } catch (error) {
                        console.error('Delete failed:', error);
                        Toast.error('Delete failed: ' + error.message);
                    }
                }
            }
            menu.remove();
        });

        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    },

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    },

    async performVectorSearch(kbId) {
        const searchInput = document.getElementById(`vectorSearchInput-${kbId}`);
        const searchResults = document.getElementById(`searchResults-${kbId}`);

        if (!searchInput || !searchResults) return;

        const query = searchInput.value.trim();
        if (!query) {
            Toast.warning('Please enter a search query');
            return;
        }

        const loading = Toast.loading('Searching...');
        searchResults.innerHTML = '<div class="loading">Searching...</div>';

        try {
            const response = await fetch(`http://localhost:8788/api/km/${kbId}/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, top_k: 5 })
            });

            if (!response.ok) throw new Error('Search failed');

            const result = await response.json();
            const results = result.data || [];

            loading.close();

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="empty-state">No results found</div>';
                return;
            }

            const html = results.map((r, idx) => `
                <div class="search-result-item">
                    <div class="result-header">
                        <span class="result-number">${idx + 1}</span>
                        <span class="result-score">Score: ${(r.score || 0).toFixed(3)}</span>
                    </div>
                    <div class="result-content">${this.escapeHtml(r.content || r.text || '')}</div>
                    ${r.metadata ? `<div class="result-metadata">Source: ${this.escapeHtml(r.metadata.source || 'Unknown')}</div>` : ''}
                </div>
            `).join('');

            searchResults.innerHTML = html;
            Toast.success(`Found ${results.length} results`);
        } catch (error) {
            console.error('Search failed:', error);
            loading.close();
            Toast.error('Search failed: ' + error.message);
            searchResults.innerHTML = `<div class="error-state">Search failed: ${error.message}</div>`;
        }
    },

    saveCurrentKV(kbId) {
        const kvKeyInput = document.getElementById('kvKeyInput');
        const kvValueInput = document.getElementById('kvValueInput');

        if (!kvKeyInput || !kvValueInput) return;

        const key = kvKeyInput.value.trim();
        const value = kvValueInput.value.trim();

        if (!key) {
            Toast.warning('Key cannot be empty');
            return;
        }

        this.saveKeyValue(kbId, this.currentKvId, key, value);
    },

    clearKVForm() {
        const kvKeyInput = document.getElementById('kvKeyInput');
        const kvValueInput = document.getElementById('kvValueInput');

        if (kvKeyInput) kvKeyInput.value = '';
        if (kvValueInput) kvValueInput.value = '';

        this.currentKvId = null;

        if (this.currentKbId) {
            document.querySelectorAll(`#kvTree-${this.currentKbId} .km-tree-item`).forEach(i => i.classList.remove('active'));
        }
    }
};

// Export to global
if (typeof window !== 'undefined') {
    window.kmHandlers = kmHandlers;
}

export default kmHandlers;

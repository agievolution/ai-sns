/**
 * KM Page - Note Editor (kmtype=1)
 */

const KMNotePage = {
    render() {
        return `
            <div class="km-page-layout">
                <div class="km-editor-area">
                    <!-- Toolbar row 1: File operations -->
                    <div class="km-toolbar-row">
                        <div class="toolbar-group">
                            <button class="km-tool-btn" id="saveNoteBtn" title="保存 (Ctrl+S)">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                                </svg>
                            </button>
                            <button class="km-tool-btn" id="printBtn" title="打印">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="toolbar-group">
                            <button class="km-tool-btn" id="undoBtn" title="撤销 (Ctrl+Z)">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                                </svg>
                            </button>
                            <button class="km-tool-btn" id="redoBtn" title="重做 (Ctrl+Y)">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <!-- Toolbar row 2: Format controls -->
                    <div class="km-toolbar-row km-format-row">
                        <select class="km-font-select" id="fontSelect">
                            <option value="Microsoft YaHei UI">Microsoft YaHei UI</option>
                            <option value="SimSun">宋体</option>
                            <option value="SimHei">黑体</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                        </select>
                        <select class="km-size-select" id="sizeSelect">
                            <option value="1">10pt</option>
                            <option value="2">12pt</option>
                            <option value="3" selected>14pt</option>
                            <option value="4">16pt</option>
                            <option value="5">18pt</option>
                            <option value="6">24pt</option>
                            <option value="7">36pt</option>
                        </select>
                        <div class="km-color-picker-wrapper">
                            <input type="color" class="km-color-picker" id="colorPicker" value="#000000" title="字体颜色">
                            <button class="km-color-btn" id="colorBtn" title="字体颜色">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M9.62 12L12 5.67 14.38 12M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2z"/>
                                    <rect x="3" y="20" width="18" height="3" id="colorIndicator" fill="#000000"/>
                                </svg>
                            </button>
                        </div>
                        <div class="toolbar-divider"></div>
                        <button class="km-tool-btn format-btn" data-format="bold" title="粗体 (Ctrl+B)"><strong>B</strong></button>
                        <button class="km-tool-btn format-btn" data-format="italic" title="斜体 (Ctrl+I)"><em>I</em></button>
                        <button class="km-tool-btn format-btn" data-format="underline" title="下划线 (Ctrl+U)"><u>U</u></button>
                        <button class="km-tool-btn format-btn" data-format="strikeThrough" title="删除线"><s>S</s></button>
                        <div class="toolbar-divider"></div>
                        <button class="km-tool-btn align-btn" data-action="justifyLeft" title="左对齐">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
                            </svg>
                        </button>
                        <button class="km-tool-btn align-btn" data-action="justifyCenter" title="居中">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
                            </svg>
                        </button>
                        <button class="km-tool-btn align-btn" data-action="justifyRight" title="右对齐">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
                            </svg>
                        </button>
                        <button class="km-tool-btn align-btn" data-action="justifyFull" title="两端对齐">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zM3 3v2h18V3H3z"/>
                            </svg>
                        </button>
                        <div class="toolbar-divider"></div>
                        <button class="km-tool-btn list-btn" data-action="insertUnorderedList" title="无序列表">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
                            </svg>
                        </button>
                        <button class="km-tool-btn list-btn" data-action="insertOrderedList" title="有序列表">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
                            </svg>
                        </button>
                        <button class="km-tool-btn indent-btn" data-action="outdent" title="减少缩进">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/>
                            </svg>
                        </button>
                        <button class="km-tool-btn indent-btn" data-action="indent" title="增加缩进">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/>
                            </svg>
                        </button>
                    </div>
                    <!-- Editor content -->
                    <div class="km-editor-content" id="noteContent" contenteditable="true">
                        <p></p>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.bindEditorEvents();
        this.bindToolbarEvents();
        this.bindKeyboardShortcuts();
    },

    bindEditorEvents() {
        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;

        // Auto-save on content change (debounced)
        let autoSaveTimer;
        noteContent.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                // Optional: implement auto-save here
                // window.kmHandlers.saveNote(true); // true = silent save
            }, 3000);
        });

        // Update toolbar state based on selection
        noteContent.addEventListener('mouseup', () => this.updateToolbarState());
        noteContent.addEventListener('keyup', () => this.updateToolbarState());
    },

    bindToolbarEvents() {
        // Save button
        const saveBtn = document.getElementById('saveNoteBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => window.kmHandlers.saveNote());
        }

        // Print button
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }

        // Undo/Redo buttons
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => document.execCommand('undo'));
        }

        const redoBtn = document.getElementById('redoBtn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => document.execCommand('redo'));
        }

        // Font selector
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                document.execCommand('fontName', false, e.target.value);
                document.getElementById('noteContent').focus();
            });
        }

        // Size selector
        const sizeSelect = document.getElementById('sizeSelect');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                document.execCommand('fontSize', false, e.target.value);
                document.getElementById('noteContent').focus();
            });
        }

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        const colorBtn = document.getElementById('colorBtn');
        if (colorPicker && colorBtn) {
            colorPicker.addEventListener('change', (e) => {
                const color = e.target.value;
                document.execCommand('foreColor', false, color);
                const indicator = document.getElementById('colorIndicator');
                if (indicator) indicator.setAttribute('fill', color);
                document.getElementById('noteContent').focus();
            });

            colorBtn.addEventListener('click', () => {
                colorPicker.click();
            });
        }

        // Format buttons (bold, italic, underline, strikethrough)
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                document.execCommand(format, false, null);
                this.updateToolbarState();
                document.getElementById('noteContent').focus();
            });
        });

        // Align buttons
        document.querySelectorAll('.align-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                document.execCommand(action, false, null);
                this.updateToolbarState();
                document.getElementById('noteContent').focus();
            });
        });

        // List buttons
        document.querySelectorAll('.list-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                document.execCommand(action, false, null);
                this.updateToolbarState();
                document.getElementById('noteContent').focus();
            });
        });

        // Indent buttons
        document.querySelectorAll('.indent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                document.execCommand(action, false, null);
                document.getElementById('noteContent').focus();
            });
        });
    },

    bindKeyboardShortcuts() {
        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;

        noteContent.addEventListener('keydown', (e) => {
            // Ctrl+S: Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                window.kmHandlers.saveNote();
                return;
            }

            // Ctrl+B: Bold
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold');
                this.updateToolbarState();
                return;
            }

            // Ctrl+I: Italic
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic');
                this.updateToolbarState();
                return;
            }

            // Ctrl+U: Underline
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline');
                this.updateToolbarState();
                return;
            }

            // Ctrl+Z: Undo (default behavior, but ensure it works)
            if (e.ctrlKey && e.key === 'z') {
                // Let browser handle it
            }

            // Ctrl+Y: Redo
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                document.execCommand('redo');
            }
        });
    },

    updateToolbarState() {
        // Update format button states
        document.querySelectorAll('.format-btn').forEach(btn => {
            const format = btn.dataset.format;
            const isActive = document.queryCommandState(format);
            btn.classList.toggle('active', isActive);
        });

        // Update align button states
        document.querySelectorAll('.align-btn').forEach(btn => {
            const action = btn.dataset.action;
            const isActive = document.queryCommandState(action);
            btn.classList.toggle('active', isActive);
        });

        // Update list button states
        document.querySelectorAll('.list-btn').forEach(btn => {
            const action = btn.dataset.action;
            const isActive = document.queryCommandState(action);
            btn.classList.toggle('active', isActive);
        });
    },

    destroy() {
        // Clean up event listeners if needed
    }
};

export default KMNotePage;

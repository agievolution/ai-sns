/**
 * KM Management Dialog
 * 知识库管理对话框 - 创建/编辑/删除知识库
 */

import Toast from '../../utils/toast.js';

const KMManagementDialog = {
    /**
     * Show create KB dialog
     */
    async showCreateDialog() {
        return new Promise((resolve) => {
            const backdrop = this.createBackdrop();
            const dialog = this.createDialog('Create Knowledge Base', null, (kbData) => {
                backdrop.remove();
                resolve(kbData);
            }, () => {
                backdrop.remove();
                resolve(null);
            });

            backdrop.appendChild(dialog);
            document.body.appendChild(backdrop);

            // Focus on name input
            setTimeout(() => {
                const nameInput = dialog.querySelector('#kmNameInput');
                if (nameInput) nameInput.focus();
            }, 100);
        });
    },

    /**
     * Show edit KB dialog
     */
    async showEditDialog(kb) {
        return new Promise((resolve) => {
            const backdrop = this.createBackdrop();
            const dialog = this.createDialog('Edit Knowledge Base', kb, (kbData) => {
                backdrop.remove();
                resolve(kbData);
            }, () => {
                backdrop.remove();
                resolve(null);
            });

            backdrop.appendChild(dialog);
            document.body.appendChild(backdrop);

            // Focus on name input
            setTimeout(() => {
                const nameInput = dialog.querySelector('#kmNameInput');
                if (nameInput) nameInput.focus();
            }, 100);
        });
    },

    /**
     * Create backdrop
     */
    createBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.className = 'km-dialog-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 100002;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out;
        `;
        return backdrop;
    },

    /**
     * Create dialog
     */
    createDialog(title, kb = null, onSave, onCancel) {
        const isEdit = kb !== null;
        const dialog = document.createElement('div');
        dialog.className = 'km-management-dialog';
        dialog.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            min-width: 500px;
            max-width: 600px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
            animation: slideInDown 0.3s ease-out;
        `;

        dialog.innerHTML = `
            <div class="dialog-header" style="margin-bottom: 24px;">
                <h2 style="margin: 0; font-size: 20px; color: #333;">${this.escapeHtml(title)}</h2>
            </div>
            <div class="dialog-body">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #555;">
                        Knowledge Base Name <span style="color: #f44336;">*</span>
                    </label>
                    <input
                        type="text"
                        id="kmNameInput"
                        class="form-input"
                        placeholder="Enter knowledge base name"
                        value="${this.escapeHtml(kb?.name || '')}"
                        style="
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 14px;
                            box-sizing: border-box;
                        "
                    >
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #555;">
                        Description
                    </label>
                    <textarea
                        id="kmMemoInput"
                        class="form-textarea"
                        rows="4"
                        placeholder="Enter description (optional)"
                        style="
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 14px;
                            resize: vertical;
                            box-sizing: border-box;
                            font-family: inherit;
                        "
                    >${this.escapeHtml(kb?.memo || '')}</textarea>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #555;">
                        Type <span style="color: #f44336;">*</span>
                    </label>
                    <select
                        id="kmTypeSelect"
                        class="form-select"
                        ${isEdit ? 'disabled' : ''}
                        style="
                            width: 100%;
                            padding: 10px 12px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 14px;
                            background: ${isEdit ? '#f5f5f5' : 'white'};
                            cursor: ${isEdit ? 'not-allowed' : 'pointer'};
                            box-sizing: border-box;
                        "
                    >
                        <option value="1" ${kb?.kmtype === 1 ? 'selected' : ''}>Note (Rich Text Editor)</option>
                        <option value="0" ${kb?.kmtype === 0 ? 'selected' : ''}>File (Document Upload & Vector Search)</option>
                        <option value="2" ${kb?.kmtype === 2 ? 'selected' : ''}>Key-Value (Simple Data Storage)</option>
                    </select>
                    ${isEdit ? '<div style="font-size: 12px; color: #999; margin-top: 4px;">Type cannot be changed after creation</div>' : ''}
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input
                            type="checkbox"
                            id="kmShowCheckbox"
                            ${kb?.is_show !== false ? 'checked' : ''}
                            style="margin-right: 8px; cursor: pointer;"
                        >
                        <span style="font-weight: 500; color: #555;">Show in sidebar</span>
                    </label>
                </div>
            </div>
            <div class="dialog-footer" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                <button
                    id="kmCancelBtn"
                    class="btn-secondary"
                    style="
                        padding: 10px 20px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        color: #666;
                        transition: all 0.2s;
                    "
                >Cancel</button>
                <button
                    id="kmSaveBtn"
                    class="btn-primary"
                    style="
                        padding: 10px 20px;
                        border: none;
                        background: #1a73e8;
                        color: white;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                    "
                >${isEdit ? 'Save Changes' : 'Create'}</button>
            </div>
        `;

        // Add styles if not exists
        if (!document.getElementById('km-dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'km-dialog-styles';
            style.textContent = `
                #kmCancelBtn:hover {
                    background: #f5f5f5;
                    border-color: #ccc;
                }
                #kmSaveBtn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
                }
                .form-input:focus, .form-textarea:focus, .form-select:focus {
                    outline: none;
                    border-color: #1a73e8;
                    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
                }
            `;
            document.head.appendChild(style);
        }

        // Bind events
        const saveBtn = dialog.querySelector('#kmSaveBtn');
        const cancelBtn = dialog.querySelector('#kmCancelBtn');
        const nameInput = dialog.querySelector('#kmNameInput');
        const memoInput = dialog.querySelector('#kmMemoInput');
        const typeSelect = dialog.querySelector('#kmTypeSelect');
        const showCheckbox = dialog.querySelector('#kmShowCheckbox');

        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (!name) {
                Toast.warning('Please enter knowledge base name');
                nameInput.focus();
                return;
            }

            const kbData = {
                name,
                memo: memoInput.value.trim(),
                kmtype: parseInt(typeSelect.value),
                is_show: showCheckbox.checked
            };

            if (isEdit) {
                kbData.id = kb.id;
                kbData.km_id = kb.km_id;
            }

            onSave(kbData);
        });

        cancelBtn.addEventListener('click', () => {
            onCancel();
        });

        // Handle ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onCancel();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Handle Enter key (save)
        const handleEnter = (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                saveBtn.click();
            }
        };
        dialog.addEventListener('keydown', handleEnter);

        return dialog;
    },

    /**
     * Confirm delete KB
     */
    async confirmDelete(kb) {
        return Toast.confirm(
            `Are you sure you want to delete "${kb.name}"? This action cannot be undone.`,
            {
                title: 'Delete Knowledge Base',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                type: 'error'
            }
        );
    },

    /**
     * Create knowledge base
     */
    async createKB(kbData) {
        const loading = Toast.loading('Creating knowledge base...');

        try {
            // Generate unique km_id
            kbData.km_id = this.generateKMId();

            const response = await fetch('http://localhost:8788/api/km', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(kbData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create knowledge base');
            }

            const result = await response.json();
            loading.close();
            Toast.success('Knowledge base created successfully');
            return result.data;
        } catch (error) {
            console.error('Create KB failed:', error);
            loading.close();
            Toast.error('Failed to create: ' + error.message);
            return null;
        }
    },

    /**
     * Update knowledge base
     */
    async updateKB(kbData) {
        const loading = Toast.loading('Updating knowledge base...');

        try {
            const response = await fetch(`http://localhost:8788/api/km/${kbData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(kbData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update knowledge base');
            }

            const result = await response.json();
            loading.close();
            Toast.success('Knowledge base updated successfully');
            return result.data;
        } catch (error) {
            console.error('Update KB failed:', error);
            loading.close();
            Toast.error('Failed to update: ' + error.message);
            return null;
        }
    },

    /**
     * Delete knowledge base
     */
    async deleteKB(kbId) {
        const loading = Toast.loading('Deleting knowledge base...');

        try {
            const response = await fetch(`http://localhost:8788/api/km/${kbId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete knowledge base');
            }

            loading.close();
            Toast.success('Knowledge base deleted successfully');
            return true;
        } catch (error) {
            console.error('Delete KB failed:', error);
            loading.close();
            Toast.error('Failed to delete: ' + error.message);
            return false;
        }
    },

    /**
     * Generate unique KM ID
     */
    generateKMId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomChars = Array.from({ length: 2 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');

        const timestamp = Date.now().toString().slice(-15);
        return `${randomChars}${timestamp}`;
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

export default KMManagementDialog;

// Global access
if (typeof window !== 'undefined') {
    window.KMManagementDialog = KMManagementDialog;
}

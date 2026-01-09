/**
 * Web Handlers - 事件处理
 */

const webHandlers = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // Add LLM 按钮
        const addBtn = document.getElementById('addLLMBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddLLMModal());
        }

        // Manage LLM 按钮
        const manageBtn = document.getElementById('manageLLMBtn');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => this.showManageLLMModal());
        }

        // LLM 图标点击 - 打开链接
        document.querySelectorAll('.web-llm-icon-box').forEach(box => {
            box.addEventListener('click', () => {
                const url = box.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });

        // AI Tools 项点击
        document.querySelectorAll('.web-tool-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            });
        });

        // Category 展开/折叠
        const categoryHeader = document.querySelector('.web-category-header');
        if (categoryHeader) {
            categoryHeader.addEventListener('click', () => {
                const toolsList = document.querySelector('.web-tools-list');
                const chevron = categoryHeader.querySelector('.chevron');
                if (toolsList) {
                    toolsList.style.display = toolsList.style.display === 'none' ? 'block' : 'none';
                }
                if (chevron) {
                    chevron.style.transform = toolsList.style.display === 'none' ? 'rotate(-90deg)' : 'rotate(0deg)';
                }
            });
        }
    },

    showAddLLMModal() {
        if (typeof Modal === 'undefined') {
            console.error('Modal component not loaded');
            return;
        }

        Modal.show({
            title: '添加 LLM 服务',
            content: `
                <div class="form-group">
                    <label>服务名称</label>
                    <input type="text" class="form-input" id="llmName" placeholder="例如：ChatGPT">
                </div>
                <div class="form-group">
                    <label>服务 URL</label>
                    <input type="url" class="form-input" id="llmUrl" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>图标颜色</label>
                    <input type="color" class="form-input" id="llmColor" value="#1a73e8">
                </div>
            `,
            confirmText: '添加',
            onConfirm: () => {
                const name = document.getElementById('llmName')?.value;
                const url = document.getElementById('llmUrl')?.value;

                if (!name || !url) {
                    if (typeof Notification !== 'undefined') {
                        Notification.error('请填写完整信息');
                    }
                    return false;
                }

                if (typeof Notification !== 'undefined') {
                    Notification.success('LLM 服务已添加');
                }
            }
        });
    },

    showManageLLMModal() {
        if (typeof Modal === 'undefined') {
            console.error('Modal component not loaded');
            return;
        }

        Modal.show({
            title: '管理 LLM 服务',
            content: `
                <div class="llm-manage-list">
                    <div class="llm-manage-item">
                        <span class="llm-manage-name">DeepSeek</span>
                        <div class="llm-manage-actions">
                            <button class="btn-sm" data-action="edit">编辑</button>
                            <button class="btn-sm btn-danger" data-action="delete">删除</button>
                        </div>
                    </div>
                    <div class="llm-manage-item">
                        <span class="llm-manage-name">OpenAI</span>
                        <div class="llm-manage-actions">
                            <button class="btn-sm" data-action="edit">编辑</button>
                            <button class="btn-sm btn-danger" data-action="delete">删除</button>
                        </div>
                    </div>
                    <div class="llm-manage-item">
                        <span class="llm-manage-name">Claude</span>
                        <div class="llm-manage-actions">
                            <button class="btn-sm" data-action="edit">编辑</button>
                            <button class="btn-sm btn-danger" data-action="delete">删除</button>
                        </div>
                    </div>
                </div>
            `,
            showCancel: false,
            confirmText: '关闭'
        });
    },

    destroy() {
        // 清理事件监听器
    }
};

export default webHandlers;

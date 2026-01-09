/**
 * Tools Handlers - 事件处理
 */

const toolsHandlers = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        // 导入插件按钮
        const importBtn = document.getElementById('importPluginBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportPluginModal());
        }

        // 删除插件按钮
        const deleteBtn = document.getElementById('deletePluginBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.showDeletePluginModal());
        }

        // LLM图标点击
        document.querySelectorAll('.llm-icon-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.llm-icon-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // 下载按钮
        document.querySelectorAll('.plugin-download-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof Notification !== 'undefined') {
                    Notification.info('插件下载功能开发中...');
                }
            });
        });

        // 分类项点击
        document.querySelectorAll('.tools-category-item').forEach(item => {
            item.addEventListener('click', () => {
                console.log('Category clicked:', item.textContent.trim());
            });
        });
    },

    showImportPluginModal() {
        if (typeof Modal === 'undefined') {
            console.error('Modal component not loaded');
            return;
        }

        Modal.show({
            title: '导入插件',
            content: `
                <div class="form-group">
                    <label>插件文件</label>
                    <input type="file" class="form-input" id="pluginFile" accept=".zip,.json">
                </div>
                <p class="form-hint">支持 .zip 或 .json 格式的插件文件</p>
            `,
            confirmText: '导入',
            onConfirm: () => {
                const fileInput = document.getElementById('pluginFile');
                if (!fileInput || !fileInput.files.length) {
                    if (typeof Notification !== 'undefined') {
                        Notification.error('请选择插件文件');
                    }
                    return false;
                }
                if (typeof Notification !== 'undefined') {
                    Notification.success('插件导入成功');
                }
            }
        });
    },

    showDeletePluginModal() {
        if (typeof Modal === 'undefined') {
            console.error('Modal component not loaded');
            return;
        }

        Modal.show({
            title: '删除插件',
            content: `
                <p>请选择要删除的插件：</p>
                <div class="plugin-delete-list">
                    <label class="plugin-delete-item">
                        <input type="checkbox" value="openai">
                        <span>OpenAI</span>
                    </label>
                    <label class="plugin-delete-item">
                        <input type="checkbox" value="claude">
                        <span>Claude</span>
                    </label>
                    <label class="plugin-delete-item">
                        <input type="checkbox" value="deepseek">
                        <span>DeepSeek</span>
                    </label>
                </div>
            `,
            confirmText: '删除',
            onConfirm: () => {
                const selected = Array.from(document.querySelectorAll('.plugin-delete-item input:checked'));
                if (selected.length === 0) {
                    if (typeof Notification !== 'undefined') {
                        Notification.error('请选择要删除的插件');
                    }
                    return false;
                }
                if (typeof Notification !== 'undefined') {
                    Notification.success(`已删除 ${selected.length} 个插件`);
                }
            }
        });
    },

    destroy() {
        // 清理事件监听器
    }
};

export default toolsHandlers;

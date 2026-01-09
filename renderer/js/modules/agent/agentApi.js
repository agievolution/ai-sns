/**
 * Agent API - API调用封装
 * 处理与后端的通信
 */

const agentApi = {
    /**
     * 获取Agent列表
     */
    async getAgents() {
        try {
            if (window.api && window.api.getAgents) {
                return await window.api.getAgents();
            }
            // 模拟数据
            return {
                success: true,
                data: [
                    { id: 1, name: 'Balabala', model: 'GPT-4' },
                    { id: 2, name: 'Justin', model: 'Claude 3' },
                    { id: 3, name: 'Peter', model: 'DeepSeek' },
                    { id: 4, name: 'Musk (Planner)', model: 'GPT-4' },
                    { id: 5, name: 'Mike (Critic)', model: 'GPT-3.5' }
                ]
            };
        } catch (error) {
            console.error('获取Agent列表失败:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * 创建Agent
     */
    async createAgent(agentData) {
        try {
            if (window.api && window.api.createAgent) {
                return await window.api.createAgent(agentData);
            }
            // 模拟创建
            return {
                success: true,
                data: { id: Date.now(), ...agentData }
            };
        } catch (error) {
            console.error('创建Agent失败:', error);
            throw error;
        }
    },

    /**
     * 获取聊天历史
     */
    async getChatHistory() {
        try {
            if (window.api && window.api.getChatHistory) {
                return await window.api.getChatHistory();
            }
            // 模拟数据
            return {
                success: true,
                data: [
                    { id: 1, title: 'introduce me to the functio...', lastMessage: 'Function介绍...', starred: true },
                    { id: 2, title: 'hello', lastMessage: '你好！', starred: false },
                    { id: 3, title: '@upload:go', lastMessage: 'Go文件上传...', starred: false },
                    { id: 4, title: '@download:go', lastMessage: 'Go文件下载...', starred: false }
                ]
            };
        } catch (error) {
            console.error('获取聊天历史失败:', error);
            return { success: false, data: [] };
        }
    },

    /**
     * 发送消息 (流式)
     */
    async sendMessageStream(messages, requestId) {
        try {
            if (window.electronAPI && window.electronAPI.chatStreamStart) {
                window.electronAPI.chatStreamStart(messages, requestId);
                return { success: true };
            }
            // 如果没有 electronAPI，返回失败
            throw new Error('流式聊天API不可用');
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    },

    /**
     * 发送消息 (非流式，用于兼容)
     */
    async sendMessage(messages) {
        try {
            if (window.api && window.api.chat) {
                return await window.api.chat({ messages });
            }
            // 模拟响应
            return {
                success: true,
                data: {
                    role: 'assistant',
                    content: '这是一个模拟响应。'
                }
            };
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    },

    /**
     * 删除聊天
     */
    async deleteChat(chatId) {
        try {
            if (window.api && window.api.deleteChat) {
                return await window.api.deleteChat(chatId);
            }
            return { success: true };
        } catch (error) {
            console.error('删除聊天失败:', error);
            throw error;
        }
    },

    /**
     * 更新聊天标题
     */
    async updateChatTitle(chatId, title) {
        try {
            if (window.api && window.api.updateChatTitle) {
                return await window.api.updateChatTitle(chatId, title);
            }
            return { success: true };
        } catch (error) {
            console.error('更新聊天标题失败:', error);
            throw error;
        }
    },

    /**
     * 收藏/取消收藏聊天
     */
    async toggleChatStar(chatId, starred) {
        try {
            if (window.api && window.api.toggleChatStar) {
                return await window.api.toggleChatStar(chatId, starred);
            }
            return { success: true };
        } catch (error) {
            console.error('收藏操作失败:', error);
            throw error;
        }
    }
};

export default agentApi;

/**
 * Agent Knowledge Base Config Event Handler
 * 处理知识库配置按钮的点击事件
 */

document.addEventListener('click', function(e) {
    const kbBtn = e.target.closest('.toolbar-icon-btn[title="配置知识库"][data-agent-id]');

    if (kbBtn) {
        e.preventDefault();
        e.stopPropagation();

        const agentId = kbBtn.dataset.agentId;
        console.log('[AgentKnowledgeBaseConfig] Opening KB dialog for agent:', agentId);

        if (window.AgentKnowledgeBaseDialog) {
            window.AgentKnowledgeBaseDialog.open(agentId);
        } else {
            console.error('[AgentKnowledgeBaseConfig] AgentKnowledgeBaseDialog not loaded');
        }
    }
});

console.log('[AgentKnowledgeBaseConfig] Event handler initialized');

/**
 * SNS Module - Sidebar
 * SNS侧边栏渲染
 */

export default {
    /**
     * 渲染SNS页面侧边栏
     */
    render() {
        return `
            <div class="sidebar-section">
                <div class="sidebar-header-row">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#1a73e8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>
                    <span class="sidebar-section-title">Explore the Earth-Y宝</span>
                </div>
                <!-- 用户属性面板 -->
                <div class="user-stats-panel">
                    <div class="user-stat-badges">
                        <span class="stat-badge level">Level3</span>
                        <span class="stat-badge credit">Credit:100</span>
                        <span class="stat-badge money">Money:10,996.61</span>
                    </div>
                    <div class="user-stat-info">
                        <div class="stat-row">Life:125 | IO:70</div>
                        <div class="stat-row">Energy:150 | Move:187.5</div>
                        <div class="stat-row">Exp:30</div>
                        <div class="stat-progress">
                            <div class="progress-track"><div class="progress-fill" style="width: 30%"></div></div>
                            <div class="progress-labels"><span>0</span><span>50</span><span>100</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sidebar-section">
                <!-- Chat / Trade tabs -->
                <div class="sns-sidebar-tabs">
                    <button class="sidebar-tab active">Chat</button>
                    <button class="sidebar-tab">Trade</button>
                </div>
                <!-- Contact List -->
                <div class="contact-section">
                    <div class="contact-header">Contact List</div>
                    <div class="contact-tree">
                        <div class="tree-item">
                            <span class="tree-toggle">▸</span>
                            <span class="tree-label">Buddies</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sidebar-section sns-user-footer">
                <div class="sns-user-item">
                    <div class="user-dot online"></div>
                    <span class="user-label">rongrong</span>
                </div>
            </div>
        `;
    }
};

/**
 * SNS Module - State Management
 * SNS状态管理
 */

const snsState = {
    // 地图状态
    map: {
        initialized: false,
        center: { lng: 116.404, lat: 39.915 },
        zoom: 12,
        markers: []
    },

    // 用户状态
    user: {
        money: 10996.61,
        life: 125,
        energy: 150,
        profession: '医生',
        level: 3,
        credit: 100,
        exp: 30,
        location: {
            lng: 116.36383031947238,
            lat: 39.76458567198844
        }
    },

    // 在线状态
    online: {
        status: 'online',
        nodes: 0,
        activeUsers: 0,
        messageCount: 0
    },

    // 移动模式
    moveMode: 'free', // 'route', 'free', 'follow'

    // 面板状态
    panels: {
        toolbar: {
            collapsed: false
        },
        settings: {
            collapsed: false
        },
        status: {
            collapsed: false,
            activeTab: 'process' // 'process', 'resource', 'think'
        }
    },

    // WebSocket连接状态
    websocket: {
        connected: false,
        reconnecting: false
    }
};

export default {
    /**
     * 获取状态
     */
    getState() {
        return snsState;
    },

    /**
     * 更新地图状态
     */
    updateMap(mapData) {
        Object.assign(snsState.map, mapData);
    },

    /**
     * 更新用户状态
     */
    updateUser(userData) {
        Object.assign(snsState.user, userData);
    },

    /**
     * 更新在线状态
     */
    updateOnline(onlineData) {
        Object.assign(snsState.online, onlineData);
    },

    /**
     * 设置移动模式
     */
    setMoveMode(mode) {
        snsState.moveMode = mode;
    },

    /**
     * 更新面板状态
     */
    updatePanel(panelName, panelData) {
        if (snsState.panels[panelName]) {
            Object.assign(snsState.panels[panelName], panelData);
        }
    },

    /**
     * 添加标记
     */
    addMarker(marker) {
        snsState.map.markers.push(marker);
    },

    /**
     * 移除标记
     */
    removeMarker(markerId) {
        snsState.map.markers = snsState.map.markers.filter(m => m.id !== markerId);
    },

    /**
     * 清空所有标记
     */
    clearMarkers() {
        snsState.map.markers = [];
    },

    /**
     * 更新WebSocket状态
     */
    updateWebSocket(wsData) {
        Object.assign(snsState.websocket, wsData);
    }
};

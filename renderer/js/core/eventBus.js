/**
 * Event Bus - 模块间通信
 * 用于解耦模块之间的直接依赖
 */

class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    on(event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    /**
     * 取消订阅事件
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    off(event, handler) {
        if (!this.events[event]) return;

        if (!handler) {
            // 如果没有指定 handler，移除所有该事件的处理函数
            delete this.events[event];
        } else {
            this.events[event] = this.events[event].filter(h => h !== handler);
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        if (!this.events[event]) return;

        this.events[event].forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for '${event}':`, error);
            }
        });
    }

    /**
     * 一次性订阅事件
     * @param {string} event - 事件名称
     * @param {Function} handler - 事件处理函数
     */
    once(event, handler) {
        const onceHandler = (data) => {
            handler(data);
            this.off(event, onceHandler);
        };
        this.on(event, onceHandler);
    }

    /**
     * 清除所有事件
     */
    clear() {
        this.events = {};
    }
}

// 导出单例
const eventBus = new EventBus();
window.eventBus = eventBus;

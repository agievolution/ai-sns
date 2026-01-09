/**
 * Storage - 本地存储封装
 * 统一管理localStorage
 */

class Storage {
    constructor() {
        this.prefix = 'ai-sns-';
    }

    /**
     * 获取存储的值
     * @param {string} key - 键名
     * @param {*} defaultValue - 默认值
     * @returns {*}
     */
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            if (value === null) return defaultValue;
            return JSON.parse(value);
        } catch (error) {
            console.error(`Error getting storage key '${key}':`, error);
            return defaultValue;
        }
    }

    /**
     * 设置存储的值
     * @param {string} key - 键名
     * @param {*} value - 值
     */
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting storage key '${key}':`, error);
        }
    }

    /**
     * 删除存储的值
     * @param {string} key - 键名
     */
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (error) {
            console.error(`Error removing storage key '${key}':`, error);
        }
    }

    /**
     * 清除所有存储
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    /**
     * 获取所有键
     * @returns {Array<string>}
     */
    keys() {
        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.substring(this.prefix.length));
        } catch (error) {
            console.error('Error getting storage keys:', error);
            return [];
        }
    }
}

// 导出单例
const storage = new Storage();
window.storage = storage;

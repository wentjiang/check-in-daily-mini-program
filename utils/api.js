"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = void 0;
// API基础配置
const API_BASE_URL = 'http://localhost:8000/api'; // 开发环境
class ApiService {
    constructor() {
        this.token = null;
    }
    // 设置认证令牌
    setToken(token) {
        this.token = token;
        wx.setStorageSync('access_token', token);
    }
    // 获取认证令牌
    getToken() {
        if (!this.token) {
            this.token = wx.getStorageSync('access_token');
        }
        return this.token;
    }
    // 清除认证令牌
    clearToken() {
        this.token = null;
        wx.removeStorageSync('access_token');
    }
    // 通用请求方法
    async request(url, options = {}) {
        const { method = 'GET', data, headers = {} } = options;
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${API_BASE_URL}${url}`,
                method,
                data,
                header: Object.assign({ 'Content-Type': 'application/json' }, headers),
                success: (res) => {
                    var _a;
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data);
                    }
                    else {
                        reject(new Error(((_a = res.data) === null || _a === void 0 ? void 0 : _a.detail) || '请求失败'));
                    }
                },
                fail: (error) => {
                    reject(new Error(error.errMsg || '网络请求失败'));
                }
            });
        });
    }
    // 用户登录
    async login(code, userInfo) {
        const response = await this.request('/users/login', {
            method: 'POST',
            data: {
                code,
                user_info: userInfo
            }
        });
        if (response.access_token) {
            this.setToken(response.access_token);
        }
        return response;
    }
    // 获取用户信息
    async getUserProfile() {
        return this.request('/users/profile');
    }
    // 更新用户信息
    async updateUserProfile(profile) {
        return this.request('/users/profile', {
            method: 'PUT',
            data: profile
        });
    }
    // 创建打卡记录
    async createCheckinRecord(record) {
        return this.request('/checkin', {
            method: 'POST',
            data: record
        });
    }
    // 获取打卡记录列表
    async getCheckinRecords(skip = 0, limit = 100) {
        return this.request(`/checkin/records?skip=${skip}&limit=${limit}`);
    }
    // 获取单个打卡记录
    async getCheckinRecord(recordId) {
        return this.request(`/checkin/records/${recordId}`);
    }
    // 删除打卡记录
    async deleteCheckinRecord(recordId) {
        return this.request(`/checkin/records/${recordId}`, {
            method: 'DELETE'
        });
    }
    // 清空所有打卡记录
    async clearAllCheckinRecords() {
        return this.request('/checkin/records', {
            method: 'DELETE'
        });
    }
    // 获取打卡统计
    async getCheckinStats() {
        return this.request('/checkin/stats');
    }
    // 检查今天是否已打卡
    async isTodayChecked() {
        const response = await this.request('/checkin/today');
        return response.checked;
    }
}
// 创建全局API服务实例
exports.apiService = new ApiService();

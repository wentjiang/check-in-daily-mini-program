"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./utils/api");
// app.ts
App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);
        // 检查登录状态
        this.checkLoginStatus();
    },
    async checkLoginStatus() {
        try {
            const token = api_1.apiService.getToken();
            if (token) {
                // 验证token有效性
                const userProfile = await api_1.apiService.getUserProfile();
                this.globalData.userInfo = userProfile;
                this.globalData.token = token;
                console.log('登录状态有效');
            }
        }
        catch (error) {
            console.error('登录状态检查失败:', error);
            api_1.apiService.clearToken();
        }
    },
    globalData: {
        userInfo: null,
        checkinRecords: [],
        token: null
    },
    // 获取打卡记录
    async getCheckinRecords() {
        try {
            const records = await api_1.apiService.getCheckinRecords();
            this.globalData.checkinRecords = records;
            return records;
        }
        catch (error) {
            console.error('获取打卡记录失败:', error);
            return [];
        }
    },
    // 添加打卡记录
    async addCheckinRecord(record) {
        var _a;
        try {
            const newRecord = await api_1.apiService.createCheckinRecord(record);
            // 重新获取记录列表
            await this.getCheckinRecords();
            return ((_a = newRecord._id) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        }
        catch (error) {
            console.error('添加打卡记录失败:', error);
            throw error;
        }
    },
    // 检查今天是否已打卡
    async isTodayChecked() {
        try {
            return await api_1.apiService.isTodayChecked();
        }
        catch (error) {
            console.error('检查今日打卡状态失败:', error);
            return false;
        }
    },
    // 获取用户统计信息
    async getUserStats() {
        try {
            const stats = await api_1.apiService.getCheckinStats();
            return {
                totalCount: stats.total_count,
                continuousDays: stats.continuous_days,
                thisMonth: stats.this_month
            };
        }
        catch (error) {
            console.error('获取用户统计失败:', error);
            return {
                totalCount: 0,
                continuousDays: 0,
                thisMonth: 0
            };
        }
    }
});

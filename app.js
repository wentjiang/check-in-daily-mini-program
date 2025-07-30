"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloud_1 = require("./utils/cloud");
// app.ts
App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);
        // 获取用户openid
        this.getOpenid();
    },
    async getOpenid() {
        try {
            const { result } = await wx.cloud.callFunction({
                name: 'login'
            });
            this.globalData.openid = result.openid;
            console.log('获取openid成功:', result.openid);
        }
        catch (error) {
            console.error('获取openid失败:', error);
        }
    },
    globalData: {
        userInfo: null,
        checkinRecords: [],
        openid: null
    },
    // 获取打卡记录
    async getCheckinRecords() {
        if (!this.globalData.openid) {
            console.error('openid未获取');
            return [];
        }
        try {
            const records = await cloud_1.cloudService.getCheckinRecords(this.globalData.openid);
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
        if (!this.globalData.openid) {
            throw new Error('openid未获取');
        }
        try {
            const recordId = await cloud_1.cloudService.addCheckinRecord(record);
            // 重新获取记录列表
            await this.getCheckinRecords();
            return recordId;
        }
        catch (error) {
            console.error('添加打卡记录失败:', error);
            throw error;
        }
    },
    // 检查今天是否已打卡
    async isTodayChecked() {
        if (!this.globalData.openid) {
            return false;
        }
        try {
            return await cloud_1.cloudService.isTodayChecked(this.globalData.openid);
        }
        catch (error) {
            console.error('检查今日打卡状态失败:', error);
            return false;
        }
    },
    // 获取用户统计信息
    async getUserStats() {
        if (!this.globalData.openid) {
            return {
                totalCount: 0,
                continuousDays: 0,
                thisMonth: 0
            };
        }
        try {
            return await cloud_1.cloudService.getUserStats(this.globalData.openid);
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

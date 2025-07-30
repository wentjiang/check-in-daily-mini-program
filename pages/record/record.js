"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = getApp();
Page({
    data: {
        records: [],
        groupedRecords: [],
        currentMonth: '',
        totalCount: 0,
        continuousDays: 0,
        monthStats: {}
    },
    onLoad() {
        this.loadRecords();
    },
    onShow() {
        this.loadRecords();
    },
    // 下拉刷新
    onPullDownRefresh() {
        this.loadRecords();
        wx.stopPullDownRefresh();
    },
    loadRecords() {
        const records = app.getCheckinRecords();
        const groupedRecords = this.groupRecordsByMonth(records);
        const monthStats = this.calculateMonthStats(records);
        this.setData({
            records,
            groupedRecords,
            totalCount: records.length,
            monthStats
        });
        this.calculateContinuousDays();
    },
    // 按月份分组记录
    groupRecordsByMonth(records) {
        const groups = {};
        records.forEach(record => {
            const date = new Date(record.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(record);
        });
        // 转换为数组并排序
        const result = Object.keys(groups).map(month => ({
            month,
            records: groups[month].sort((a, b) => b.timestamp - a.timestamp)
        })).sort((a, b) => b.month.localeCompare(a.month));
        return result;
    },
    // 计算月度统计
    calculateMonthStats(records) {
        const stats = {};
        records.forEach(record => {
            const date = new Date(record.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!stats[monthKey]) {
                stats[monthKey] = {
                    total: 0,
                    types: {}
                };
            }
            stats[monthKey].total++;
            const type = record.customType || record.type;
            if (!stats[monthKey].types[type]) {
                stats[monthKey].types[type] = 0;
            }
            stats[monthKey].types[type]++;
        });
        return stats;
    },
    // 计算连续打卡天数
    calculateContinuousDays() {
        const records = this.data.records;
        let continuousDays = 0;
        let currentDate = new Date();
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();
            const hasRecord = records.some(record => new Date(record.timestamp).toDateString() === dateStr);
            if (hasRecord) {
                continuousDays++;
            }
            else {
                break;
            }
        }
        this.setData({
            continuousDays
        });
    },
    // 格式化时间
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('zh-CN'),
            time: date.toLocaleTimeString('zh-CN', { hour12: false })
        };
    },
    // 获取类型图标
    getTypeIcon(type) {
        const icons = {
            normal: '📝',
            work: '💼',
            study: '📚',
            exercise: '🏃',
            custom: '✨'
        };
        return icons[type] || '📝';
    },
    // 获取类型名称
    getTypeName(type, customType) {
        if (type === 'custom' && customType) {
            return customType;
        }
        const names = {
            normal: '普通打卡',
            work: '工作打卡',
            study: '学习打卡',
            exercise: '运动打卡',
            custom: '自定义'
        };
        return names[type] || '普通打卡';
    },
    // 删除记录
    deleteRecord(e) {
        const index = e.currentTarget.dataset.index;
        const record = this.data.records[index];
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这条打卡记录吗？',
            success: (res) => {
                if (res.confirm) {
                    const records = this.data.records;
                    records.splice(index, 1);
                    wx.setStorageSync('checkinRecords', records);
                    this.loadRecords();
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                }
            }
        });
    },
    // 清空所有记录
    clearAllRecords() {
        wx.showModal({
            title: '确认清空',
            content: '确定要清空所有打卡记录吗？此操作不可恢复！',
            success: (res) => {
                if (res.confirm) {
                    wx.setStorageSync('checkinRecords', []);
                    this.loadRecords();
                    wx.showToast({
                        title: '清空成功',
                        icon: 'success'
                    });
                }
            }
        });
    }
});

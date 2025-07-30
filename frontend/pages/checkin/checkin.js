"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = getApp();
let timeInterval;
Page({
    data: {
        todayChecked: false,
        checkinNote: '',
        checkinType: 'normal',
        checkinTypes: [
            { value: 'normal', label: '普通打卡', icon: '📝' },
            { value: 'work', label: '工作打卡', icon: '💼' },
            { value: 'study', label: '学习打卡', icon: '📚' },
            { value: 'exercise', label: '运动打卡', icon: '🏃' },
            { value: 'custom', label: '自定义', icon: '✨' }
        ],
        customType: '',
        showCustomInput: false,
        currentTime: '',
        currentDate: ''
    },
    onLoad() {
        this.updateTime();
        this.checkTodayStatus();
        // 每秒更新时间
        timeInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
    },
    onUnload() {
        if (timeInterval) {
            clearInterval(timeInterval);
        }
    },
    onShow() {
        this.checkTodayStatus();
    },
    updateTime() {
        const now = new Date();
        this.setData({
            currentTime: now.toLocaleTimeString('zh-CN'),
            currentDate: now.toLocaleDateString('zh-CN')
        });
    },
    checkTodayStatus() {
        const todayChecked = app.isTodayChecked();
        this.setData({
            todayChecked
        });
    },
    // 选择打卡类型
    selectType(e) {
        const type = e.currentTarget.dataset.type;
        if (type === 'custom') {
            this.setData({
                showCustomInput: true,
                checkinType: type
            });
        }
        else {
            this.setData({
                checkinType: type,
                showCustomInput: false
            });
        }
    },
    // 输入自定义类型
    inputCustomType(e) {
        this.setData({
            customType: e.detail.value
        });
    },
    // 输入打卡备注
    inputNote(e) {
        this.setData({
            checkinNote: e.detail.value
        });
    },
    // 执行打卡
    doCheckin() {
        if (this.data.todayChecked) {
            wx.showToast({
                title: '今天已经打卡了',
                icon: 'none'
            });
            return;
        }
        if (this.data.checkinType === 'custom' && !this.data.customType.trim()) {
            wx.showToast({
                title: '请输入自定义类型',
                icon: 'none'
            });
            return;
        }
        const record = {
            timestamp: Date.now(),
            date: new Date().toLocaleDateString('zh-CN'),
            time: new Date().toLocaleTimeString('zh-CN'),
            type: this.data.checkinType,
            customType: this.data.checkinType === 'custom' ? this.data.customType : '',
            note: this.data.checkinNote,
            location: ''
        };
        // 获取位置信息
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                record.location = `${res.latitude},${res.longitude}`;
                this.saveCheckinRecord(record);
            },
            fail: () => {
                this.saveCheckinRecord(record);
            }
        });
    },
    saveCheckinRecord(record) {
        app.addCheckinRecord(record);
        wx.showToast({
            title: '打卡成功！',
            icon: 'success'
        });
        this.setData({
            todayChecked: true,
            checkinNote: '',
            customType: '',
            showCustomInput: false
        });
        // 延迟返回首页
        setTimeout(() => {
            wx.switchTab({
                url: '/pages/index/index'
            });
        }, 1500);
    },
    // 查看今日打卡记录
    viewTodayRecord() {
        const records = app.getCheckinRecords();
        const today = new Date().toDateString();
        const todayRecords = records.filter((record) => new Date(record.timestamp).toDateString() === today);
        if (todayRecords.length === 0) {
            wx.showToast({
                title: '今日暂无打卡记录',
                icon: 'none'
            });
            return;
        }
        wx.navigateTo({
            url: '/pages/record/record'
        });
    }
});

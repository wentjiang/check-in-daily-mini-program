"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = getApp();
Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        canIUseGetUserProfile: false,
        canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
        todayChecked: false,
        checkinCount: 0,
        continuousDays: 0,
        currentDate: '',
        greeting: ''
    },
    onLoad() {
        this.setData({
            canIUseGetUserProfile: true
        });
        this.updatePageData();
    },
    onShow() {
        this.updatePageData();
    },
    async updatePageData() {
        const today = new Date();
        try {
            const [todayChecked, records, stats] = await Promise.all([
                app.isTodayChecked(),
                app.getCheckinRecords(),
                app.getUserStats()
            ]);
            // 设置问候语
            const hour = today.getHours();
            let greeting = '';
            if (hour < 6) {
                greeting = '夜深了，早点休息吧';
            }
            else if (hour < 12) {
                greeting = '早上好，新的一天开始了';
            }
            else if (hour < 18) {
                greeting = '下午好，继续加油';
            }
            else {
                greeting = '晚上好，今天过得怎么样';
            }
            this.setData({
                todayChecked,
                checkinCount: stats.totalCount,
                continuousDays: stats.continuousDays,
                currentDate: today.toLocaleDateString('zh-CN'),
                greeting
            });
        }
        catch (error) {
            console.error('更新页面数据失败:', error);
            wx.showToast({
                title: '数据加载失败',
                icon: 'none'
            });
        }
    },
    getUserProfile(e) {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '展示用户信息',
            success: (res) => {
                console.log(res);
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                });
            }
        });
    },
    getUserInfo(e) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        console.log(e);
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
    },
    // 快速打卡
    async quickCheckin() {
        if (this.data.todayChecked) {
            wx.showToast({
                title: '今天已经打卡了',
                icon: 'none'
            });
            return;
        }
        wx.showLoading({
            title: '打卡中...'
        });
        try {
            const record = {
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('zh-CN'),
                time: new Date().toLocaleTimeString('zh-CN'),
                type: 'quick',
                note: ''
            };
            await app.addCheckinRecord(record);
            wx.hideLoading();
            wx.showToast({
                title: '打卡成功！',
                icon: 'success'
            });
            await this.updatePageData();
        }
        catch (error) {
            wx.hideLoading();
            wx.showToast({
                title: '打卡失败，请重试',
                icon: 'none'
            });
            console.error('打卡失败:', error);
        }
    },
    // 跳转到打卡页面
    goToCheckin() {
        wx.switchTab({
            url: '/pages/checkin/checkin'
        });
    },
    // 跳转到记录页面
    goToRecord() {
        wx.switchTab({
            url: '/pages/record/record'
        });
    }
});

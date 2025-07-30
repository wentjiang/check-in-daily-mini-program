import { UserInfo, CheckinRecord } from '../../types/index';

interface CheckinStats {
  totalCount: number;
  continuousDays: number;
  thisMonth: number;
}

interface MenuItem {
  icon: string;
  title: string;
  desc: string;
  action: string;
}

interface ProfilePageData {
  userInfo: UserInfo;
  hasUserInfo: boolean;
  canIUseGetUserProfile: boolean;
  canIUseOpenData: boolean;
  checkinStats: CheckinStats;
  menuList: MenuItem[];
}

const app = getApp();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    checkinStats: {
      totalCount: 0,
      continuousDays: 0,
      thisMonth: 0
    },
    menuList: [
      {
        icon: '📊',
        title: '数据统计',
        desc: '查看详细的打卡数据',
        action: 'stats'
      },
      {
        icon: '⚙️',
        title: '设置',
        desc: '应用设置和偏好',
        action: 'settings'
      },
      {
        icon: '💡',
        title: '使用帮助',
        desc: '了解如何使用应用',
        action: 'help'
      },
      {
        icon: '📝',
        title: '意见反馈',
        desc: '告诉我们你的想法',
        action: 'feedback'
      }
    ]
  },

  onLoad(): void {
    this.setData({
      canIUseGetUserProfile: true
    });
    this.loadUserStats();
  },

  onShow(): void {
    this.loadUserStats();
  },

  loadUserStats(): void {
    const records = app.getCheckinRecords();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    // 计算本月打卡次数
    const thisMonthRecords = records.filter((record: CheckinRecord) => {
      const recordDate = new Date(record.timestamp);
      return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
    });

    // 计算连续打卡天数
    let continuousDays = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      const hasRecord = records.some((record: CheckinRecord) => 
        new Date(record.timestamp).toDateString() === dateStr
      );
      
      if (hasRecord) {
        continuousDays++;
      } else {
        break;
      }
    }

    this.setData({
      checkinStats: {
        totalCount: records.length,
        continuousDays,
        thisMonth: thisMonthRecords.length
      }
    });
  },

  getUserProfile(e: WechatMiniprogram.GetUserProfileSuccessCallbackResult): void {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res: WechatMiniprogram.GetUserProfileSuccessCallbackResult) => {
        console.log(res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    });
  },

  getUserInfo(e: any): void {
    console.log(e);
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  },

  // 菜单项点击
  handleMenuClick(e: WechatMiniprogram.TouchEvent): void {
    const action = e.currentTarget.dataset.action as string;
    
    switch (action) {
      case 'stats':
        this.showStats();
        break;
      case 'settings':
        this.showSettings();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'feedback':
        this.showFeedback();
        break;
    }
  },

  // 显示统计
  showStats(): void {
    wx.showModal({
      title: '数据统计',
      content: `总打卡次数：${this.data.checkinStats.totalCount}\n连续打卡天数：${this.data.checkinStats.continuousDays}\n本月打卡次数：${this.data.checkinStats.thisMonth}`,
      showCancel: false
    });
  },

  // 显示设置
  showSettings(): void {
    wx.showActionSheet({
      itemList: ['清除所有数据', '导出数据', '关于应用'],
      success: (res: WechatMiniprogram.ShowActionSheetSuccessCallbackResult) => {
        switch (res.tapIndex) {
          case 0:
            this.clearAllData();
            break;
          case 1:
            this.exportData();
            break;
          case 2:
            this.showAbout();
            break;
        }
      }
    });
  },

  // 显示帮助
  showHelp(): void {
    wx.showModal({
      title: '使用帮助',
      content: '1. 在首页可以快速打卡\n2. 在打卡页面可以选择不同类型的打卡\n3. 在记录页面可以查看所有打卡历史\n4. 每天只能打卡一次，请珍惜机会',
      showCancel: false
    });
  },

  // 显示反馈
  showFeedback(): void {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的使用！如有问题或建议，请联系开发者。',
      showCancel: false
    });
  },

  // 清除所有数据
  clearAllData(): void {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有数据吗？此操作不可恢复！',
      success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
        if (res.confirm) {
          wx.setStorageSync('checkinRecords', []);
          this.loadUserStats();
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 导出数据
  exportData(): void {
    const records = app.getCheckinRecords();
    if (records.length === 0) {
      wx.showToast({
        title: '暂无数据可导出',
        icon: 'none'
      });
      return;
    }

    const dataStr = JSON.stringify(records, null, 2);
    console.log('导出数据：', dataStr);
    
    wx.showToast({
      title: '数据已导出到控制台',
      icon: 'success'
    });
  },

  // 显示关于
  showAbout(): void {
    wx.showModal({
      title: '关于应用',
      content: '每日打卡 v1.0.0\n\n一个简单好用的打卡小程序，帮助你养成好习惯。\n\n开发者：AI Assistant',
      showCancel: false
    });
  }
}); 
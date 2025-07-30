import { CheckinRecord, UserInfo } from './types/index';
import { apiService } from './utils/api';

// app.ts
App<{
  globalData: {
    userInfo: UserInfo | null;
    checkinRecords: CheckinRecord[];
    token: string | null;
  };
  getCheckinRecords(): Promise<CheckinRecord[]>;
  addCheckinRecord(record: Omit<CheckinRecord, '_id'>): Promise<string>;
  isTodayChecked(): Promise<boolean>;
  getUserStats(): Promise<{
    totalCount: number;
    continuousDays: number;
    thisMonth: number;
  }>;
  checkLoginStatus(): Promise<void>;
}>({
  onLaunch() {
    // 展示本地存储能力
    const logs: number[] = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 检查登录状态
    this.checkLoginStatus();
  },

  async checkLoginStatus() {
    try {
      const token = apiService.getToken();
      if (token) {
        // 验证token有效性
        const userProfile = await apiService.getUserProfile();
        this.globalData.userInfo = userProfile;
        this.globalData.token = token;
        console.log('登录状态有效');
      }
    } catch (error) {
      console.error('登录状态检查失败:', error);
      apiService.clearToken();
    }
  },
  
  globalData: {
    userInfo: null,
    checkinRecords: [],
    token: null
  },

  // 获取打卡记录
  async getCheckinRecords(): Promise<CheckinRecord[]> {
    try {
      const records = await apiService.getCheckinRecords();
      this.globalData.checkinRecords = records;
      return records;
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      return [];
    }
  },

  // 添加打卡记录
  async addCheckinRecord(record: Omit<CheckinRecord, '_id'>): Promise<string> {
    try {
      const newRecord = await apiService.createCheckinRecord(record);
      // 重新获取记录列表
      await this.getCheckinRecords();
      return newRecord._id?.toString() || '';
    } catch (error) {
      console.error('添加打卡记录失败:', error);
      throw error;
    }
  },

  // 检查今天是否已打卡
  async isTodayChecked(): Promise<boolean> {
    try {
      return await apiService.isTodayChecked();
    } catch (error) {
      console.error('检查今日打卡状态失败:', error);
      return false;
    }
  },

  // 获取用户统计信息
  async getUserStats(): Promise<{
    totalCount: number;
    continuousDays: number;
    thisMonth: number;
  }> {
    try {
      const stats = await apiService.getCheckinStats();
      return {
        totalCount: stats.total_count,
        continuousDays: stats.continuous_days,
        thisMonth: stats.this_month
      };
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return {
        totalCount: 0,
        continuousDays: 0,
        thisMonth: 0
      };
    }
  }
}); 
// 打卡记录接口
export interface CheckinRecord {
  _id?: string;
  timestamp: number;
  date: string;
  time: string;
  type: 'quick' | 'detailed';
  note?: string;
  customType?: string;
  location?: string;
}

// 用户信息接口
export interface UserInfo {
  nickName?: string;
  avatarUrl?: string;
  gender?: number;
  country?: string;
  province?: string;
  city?: string;
  language?: string;
}

// 页面数据接口
export interface PageData {
  userInfo: UserInfo;
  hasUserInfo: boolean;
  canIUse: boolean;
  canIUseGetUserProfile: boolean;
  canIUseOpenData: boolean;
  todayChecked: boolean;
  checkinCount: number;
  continuousDays: number;
  currentDate: string;
  greeting: string;
}

// 应用实例接口
export interface AppInstance {
  globalData: {
    checkinRecords: CheckinRecord[];
  };
  isTodayChecked(): boolean;
  getCheckinRecords(): CheckinRecord[];
  addCheckinRecord(record: CheckinRecord): void;
}

// 声明全局变量
declare global {
  const getApp: () => AppInstance;
  const wx: WechatMiniprogram.Wx;
} 
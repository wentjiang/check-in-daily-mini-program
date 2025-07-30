import { CheckinRecord } from '../../types/index';

interface GroupedRecord {
  month: string;
  records: CheckinRecord[];
}

interface MonthStats {
  [key: string]: {
    total: number;
    types: { [key: string]: number };
  };
}

interface RecordPageData {
  records: CheckinRecord[];
  groupedRecords: GroupedRecord[];
  currentMonth: string;
  totalCount: number;
  continuousDays: number;
  monthStats: MonthStats;
}

interface FormattedTime {
  date: string;
  time: string;
}

const app = getApp();

Page({
  data: {
    records: [] as CheckinRecord[],
    groupedRecords: [] as GroupedRecord[],
    currentMonth: '',
    totalCount: 0,
    continuousDays: 0,
    monthStats: {} as MonthStats
  },

  onLoad(): void {
    this.loadRecords();
  },

  onShow(): void {
    this.loadRecords();
  },

  // 下拉刷新
  onPullDownRefresh(): void {
    this.loadRecords();
    wx.stopPullDownRefresh();
  },

  loadRecords(): void {
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
  groupRecordsByMonth(records: CheckinRecord[]): GroupedRecord[] {
    const groups: { [key: string]: CheckinRecord[] } = {};
    
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
  calculateMonthStats(records: CheckinRecord[]): MonthStats {
    const stats: MonthStats = {};
    
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
      
      const type = (record as any).customType || record.type;
      if (!stats[monthKey].types[type]) {
        stats[monthKey].types[type] = 0;
      }
      stats[monthKey].types[type]++;
    });

    return stats;
  },

  // 计算连续打卡天数
  calculateContinuousDays(): void {
    const records = this.data.records;
    let continuousDays = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      const hasRecord = records.some(record => 
        new Date(record.timestamp).toDateString() === dateStr
      );
      
      if (hasRecord) {
        continuousDays++;
      } else {
        break;
      }
    }

    this.setData({
      continuousDays
    });
  },

  // 格式化时间
  formatTime(timestamp: number): FormattedTime {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN', { hour12: false })
    };
  },

  // 获取类型图标
  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      normal: '📝',
      work: '💼',
      study: '📚',
      exercise: '🏃',
      custom: '✨'
    };
    return icons[type] || '📝';
  },

  // 获取类型名称
  getTypeName(type: string, customType?: string): string {
    if (type === 'custom' && customType) {
      return customType;
    }
    
    const names: { [key: string]: string } = {
      normal: '普通打卡',
      work: '工作打卡',
      study: '学习打卡',
      exercise: '运动打卡',
      custom: '自定义'
    };
    return names[type] || '普通打卡';
  },

  // 删除记录
  deleteRecord(e: WechatMiniprogram.TouchEvent): void {
    const index = e.currentTarget.dataset.index as number;
    const record = this.data.records[index];
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条打卡记录吗？',
      success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
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
  clearAllRecords(): void {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有打卡记录吗？此操作不可恢复！',
      success: (res: WechatMiniprogram.ShowModalSuccessCallbackResult) => {
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
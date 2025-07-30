import { CheckinRecord } from '../../types/index';

interface CheckinType {
  value: string;
  label: string;
  icon: string;
}

interface CheckinPageData {
  todayChecked: boolean;
  checkinNote: string;
  checkinType: string;
  checkinTypes: CheckinType[];
  customType: string;
  showCustomInput: boolean;
  currentTime: string;
  currentDate: string;
}

const app = getApp();
let timeInterval: number | undefined;

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

  onLoad(): void {
    this.updateTime();
    this.checkTodayStatus();
    // 每秒更新时间
    timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  onUnload(): void {
    if (timeInterval) {
      clearInterval(timeInterval);
    }
  },

  onShow(): void {
    this.checkTodayStatus();
  },

  updateTime(): void {
    const now = new Date();
    this.setData({
      currentTime: now.toLocaleTimeString('zh-CN'),
      currentDate: now.toLocaleDateString('zh-CN')
    });
  },

  checkTodayStatus(): void {
    const todayChecked = app.isTodayChecked();
    this.setData({
      todayChecked
    });
  },

  // 选择打卡类型
  selectType(e: WechatMiniprogram.TouchEvent): void {
    const type = e.currentTarget.dataset.type as string;
    if (type === 'custom') {
      this.setData({
        showCustomInput: true,
        checkinType: type
      });
    } else {
      this.setData({
        checkinType: type,
        showCustomInput: false
      });
    }
  },

  // 输入自定义类型
  inputCustomType(e: WechatMiniprogram.Input): void {
    this.setData({
      customType: e.detail.value
    });
  },

  // 输入打卡备注
  inputNote(e: WechatMiniprogram.Input): void {
    this.setData({
      checkinNote: e.detail.value
    });
  },

  // 执行打卡
  doCheckin(): void {
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

    const record: CheckinRecord & { customType?: string; location?: string } = {
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('zh-CN'),
      time: new Date().toLocaleTimeString('zh-CN'),
      type: this.data.checkinType as 'quick' | 'detailed',
      customType: this.data.checkinType === 'custom' ? this.data.customType : '',
      note: this.data.checkinNote,
      location: ''
    };

    // 获取位置信息
    wx.getLocation({
      type: 'gcj02',
      success: (res: WechatMiniprogram.GetLocationSuccessCallbackResult) => {
        record.location = `${res.latitude},${res.longitude}`;
        this.saveCheckinRecord(record);
      },
      fail: () => {
        this.saveCheckinRecord(record);
      }
    });
  },

  saveCheckinRecord(record: CheckinRecord & { customType?: string; location?: string }): void {
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
  viewTodayRecord(): void {
    const records = app.getCheckinRecords();
    const today = new Date().toDateString();
    const todayRecords = records.filter((record: CheckinRecord) => 
      new Date(record.timestamp).toDateString() === today
    );

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
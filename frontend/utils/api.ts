import { CheckinRecord, UserInfo } from '../types/index';

// API基础配置
const API_BASE_URL = 'http://localhost:8000/api'; // 开发环境
// const API_BASE_URL = 'https://your-domain.com/api'; // 生产环境

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

interface CheckinStats {
  total_count: number;
  continuous_days: number;
  this_month: number;
}

class ApiService {
  private token: string | null = null;

  // 设置认证令牌
  setToken(token: string) {
    this.token = token;
    wx.setStorageSync('access_token', token);
  }

  // 获取认证令牌
  getToken(): string | null {
    if (!this.token) {
      this.token = wx.getStorageSync('access_token');
    }
    return this.token;
  }

  // 清除认证令牌
  clearToken() {
    this.token = null;
    wx.removeStorageSync('access_token');
  }

  // 通用请求方法
  private async request<T>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', data, headers = {} } = options;
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_BASE_URL}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...headers
        },
        success: (res: any) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(res.data?.detail || '请求失败'));
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '网络请求失败'));
        }
      });
    });
  }

  // 用户登录
  async login(code: string, userInfo?: UserInfo): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/users/login', {
      method: 'POST',
      data: {
        code,
        user_info: userInfo
      }
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  // 获取用户信息
  async getUserProfile(): Promise<UserInfo> {
    return this.request<UserInfo>('/users/profile');
  }

  // 更新用户信息
  async updateUserProfile(profile: Partial<UserInfo>): Promise<UserInfo> {
    return this.request<UserInfo>('/users/profile', {
      method: 'PUT',
      data: profile
    });
  }

  // 创建打卡记录
  async createCheckinRecord(record: Omit<CheckinRecord, '_id'>): Promise<CheckinRecord> {
    return this.request<CheckinRecord>('/checkin', {
      method: 'POST',
      data: record
    });
  }

  // 获取打卡记录列表
  async getCheckinRecords(skip: number = 0, limit: number = 100): Promise<CheckinRecord[]> {
    return this.request<CheckinRecord[]>(`/checkin/records?skip=${skip}&limit=${limit}`);
  }

  // 获取单个打卡记录
  async getCheckinRecord(recordId: number): Promise<CheckinRecord> {
    return this.request<CheckinRecord>(`/checkin/records/${recordId}`);
  }

  // 删除打卡记录
  async deleteCheckinRecord(recordId: number): Promise<void> {
    return this.request<void>(`/checkin/records/${recordId}`, {
      method: 'DELETE'
    });
  }

  // 清空所有打卡记录
  async clearAllCheckinRecords(): Promise<void> {
    return this.request<void>('/checkin/records', {
      method: 'DELETE'
    });
  }

  // 获取打卡统计
  async getCheckinStats(): Promise<CheckinStats> {
    return this.request<CheckinStats>('/checkin/stats');
  }

  // 检查今天是否已打卡
  async isTodayChecked(): Promise<boolean> {
    const response = await this.request<{ checked: boolean }>('/checkin/today');
    return response.checked;
  }
}

// 创建全局API服务实例
export const apiService = new ApiService(); 
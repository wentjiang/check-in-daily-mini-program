"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudService = exports.CloudService = void 0;
// 云开发环境ID
const CLOUD_ENV = 'your-env-id'; // 请替换为你的云环境ID
// 数据库集合名称
const COLLECTIONS = {
    CHECKIN_RECORDS: 'checkin_records',
    USER_PROFILES: 'user_profiles'
};
class CloudService {
    constructor() {
        // 初始化云开发
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
            return;
        }
        wx.cloud.init({
            env: CLOUD_ENV,
            traceUser: true
        });
        this.db = wx.cloud.database();
    }
    /**
     * 获取用户打卡记录
     */
    async getCheckinRecords(openid) {
        try {
            const { data } = await this.db.collection(COLLECTIONS.CHECKIN_RECORDS)
                .where({
                _openid: openid
            })
                .orderBy('timestamp', 'desc')
                .get();
            return data.map((item) => ({
                _id: item._id,
                timestamp: item.timestamp,
                date: item.date,
                time: item.time,
                type: item.type,
                note: item.note || '',
                customType: item.customType || '',
                location: item.location || ''
            }));
        }
        catch (error) {
            console.error('获取打卡记录失败:', error);
            return [];
        }
    }
    /**
     * 添加打卡记录
     */
    async addCheckinRecord(record) {
        try {
            const { _id } = await this.db.collection(COLLECTIONS.CHECKIN_RECORDS).add({
                data: Object.assign(Object.assign({}, record), { createTime: this.db.serverDate() })
            });
            return _id;
        }
        catch (error) {
            console.error('添加打卡记录失败:', error);
            throw error;
        }
    }
    /**
     * 删除打卡记录
     */
    async deleteCheckinRecord(recordId) {
        try {
            await this.db.collection(COLLECTIONS.CHECKIN_RECORDS).doc(recordId).remove();
            return true;
        }
        catch (error) {
            console.error('删除打卡记录失败:', error);
            return false;
        }
    }
    /**
     * 清空用户所有打卡记录
     */
    async clearAllCheckinRecords(openid) {
        try {
            const { data } = await this.db.collection(COLLECTIONS.CHECKIN_RECORDS)
                .where({
                _openid: openid
            })
                .get();
            for (const record of data) {
                await this.db.collection(COLLECTIONS.CHECKIN_RECORDS).doc(record._id).remove();
            }
            return true;
        }
        catch (error) {
            console.error('清空打卡记录失败:', error);
            return false;
        }
    }
    /**
     * 检查今天是否已打卡
     */
    async isTodayChecked(openid) {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const { data } = await this.db.collection(COLLECTIONS.CHECKIN_RECORDS)
                .where({
                _openid: openid,
                timestamp: this.db.command.gte(startOfDay.getTime()).and(this.db.command.lt(endOfDay.getTime()))
            })
                .limit(1)
                .get();
            return data.length > 0;
        }
        catch (error) {
            console.error('检查今日打卡状态失败:', error);
            return false;
        }
    }
    /**
     * 获取用户统计信息
     */
    async getUserStats(openid) {
        try {
            // 获取总打卡次数
            const { total } = await this.db.collection(COLLECTIONS.CHECKIN_RECORDS)
                .where({
                _openid: openid
            })
                .count();
            // 获取本月打卡次数
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            const startOfMonth = new Date(thisYear, thisMonth, 1);
            const endOfMonth = new Date(thisYear, thisMonth + 1, 1);
            const { total: thisMonthCount } = await this.db.collection(COLLECTIONS.CHECKIN_RECORDS)
                .where({
                _openid: openid,
                timestamp: this.db.command.gte(startOfMonth.getTime()).and(this.db.command.lt(endOfMonth.getTime()))
            })
                .count();
            // 计算连续打卡天数
            const continuousDays = await this.calculateContinuousDays(openid);
            return {
                totalCount: total,
                continuousDays,
                thisMonth: thisMonthCount
            };
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
    /**
     * 计算连续打卡天数
     */
    async calculateContinuousDays(openid) {
        try {
            const { data } = await this.db.collection(COLLECTIONS.CHECKIN_RECORDS)
                .where({
                _openid: openid
            })
                .orderBy('timestamp', 'desc')
                .get();
            let continuousDays = 0;
            let currentDate = new Date();
            for (let i = 0; i < 365; i++) {
                const checkDate = new Date(currentDate);
                checkDate.setDate(checkDate.getDate() - i);
                const dateStr = checkDate.toDateString();
                const hasRecord = data.some((record) => new Date(record.timestamp).toDateString() === dateStr);
                if (hasRecord) {
                    continuousDays++;
                }
                else {
                    break;
                }
            }
            return continuousDays;
        }
        catch (error) {
            console.error('计算连续打卡天数失败:', error);
            return 0;
        }
    }
    /**
     * 保存用户信息
     */
    async saveUserProfile(openid, userInfo) {
        try {
            await this.db.collection(COLLECTIONS.USER_PROFILES).doc(openid).set({
                data: Object.assign(Object.assign({}, userInfo), { updateTime: this.db.serverDate() })
            });
            return true;
        }
        catch (error) {
            console.error('保存用户信息失败:', error);
            return false;
        }
    }
    /**
     * 获取用户信息
     */
    async getUserProfile(openid) {
        try {
            const { data } = await this.db.collection(COLLECTIONS.USER_PROFILES)
                .doc(openid)
                .get();
            return data || null;
        }
        catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    }
}
exports.CloudService = CloudService;
// 创建全局云服务实例
exports.cloudService = new CloudService();

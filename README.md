# 每日打卡微信小程序

一个使用TypeScript开发的微信小程序，帮助用户养成每日打卡的好习惯。

## 技术栈

- **前端**: 微信小程序原生框架 + TypeScript
- **后端**: Python FastAPI + MySQL
- **认证**: JWT Token
- **API**: RESTful HTTP API

## 项目结构

```
wechat-mini-program/
├── app.ts                 # 应用入口文件 (TypeScript)
├── app.json              # 应用配置文件
├── app.wxss              # 应用样式文件
├── tsconfig.json         # TypeScript配置文件
├── package.json          # 项目依赖配置
├── types/
│   └── index.d.ts        # 全局类型定义
├── utils/
│   └── api.ts            # API工具类
├── pages/
│   ├── index/
│   │   ├── index.ts      # 首页逻辑 (TypeScript)
│   │   ├── index.wxml    # 首页模板
│   │   └── index.wxss    # 首页样式
│   ├── checkin/
│   │   ├── checkin.ts    # 打卡页面逻辑 (TypeScript)
│   │   ├── checkin.wxml  # 打卡页面模板
│   │   └── checkin.wxss  # 打卡页面样式
│   ├── record/
│   │   ├── record.ts     # 记录页面逻辑 (TypeScript)
│   │   ├── record.wxml   # 记录页面模板
│   │   └── record.wxss   # 记录页面样式
│   └── profile/
│       ├── profile.ts    # 个人资料页面逻辑 (TypeScript)
│       ├── profile.wxml  # 个人资料页面模板
│       └── profile.wxss  # 个人资料页面样式
├── backend/              # Python后端项目
│   ├── app.py            # FastAPI主应用
│   ├── database.py       # 数据库配置
│   ├── models.py         # 数据模型
│   ├── schemas.py        # Pydantic模式
│   ├── crud.py           # CRUD操作
│   ├── auth.py           # 认证模块
│   ├── run.py            # 启动脚本
│   ├── requirements.txt  # Python依赖
│   └── env.example       # 环境配置示例
└── images/               # 图片资源
```

## 主要功能

1. **快速打卡**: 在首页可以快速进行打卡
2. **详细打卡**: 支持选择不同类型的打卡（工作、学习、运动等）
3. **打卡记录**: 查看历史打卡记录和统计数据
4. **个人中心**: 用户信息和应用设置

## 技术特性

### 前端特性
- **TypeScript**: 类型安全的JavaScript超集
- **微信小程序**: 原生框架开发
- **模块化**: 清晰的代码结构和模块划分

### 后端特性
- **FastAPI**: 现代化的Python Web框架
- **MySQL**: 关系型数据库存储
- **JWT认证**: 安全的用户认证机制
- **RESTful API**: 标准的API设计

## 开发环境设置

### 前端开发
1. 安装依赖：
```bash
npm install
```

2. 在微信开发者工具中导入项目

3. 确保项目配置中启用了TypeScript支持

### 后端开发
1. 进入后端目录：
```bash
cd backend
```

2. 安装Python依赖：
```bash
pip install -r requirements.txt
```

3. 配置数据库和环境变量（参考BACKEND_SETUP.md）

4. 启动后端服务：
```bash
python run.py
```

## API接口

### 用户相关
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

### 打卡记录相关
- `POST /api/checkin` - 创建打卡记录
- `GET /api/checkin/records` - 获取打卡记录列表
- `DELETE /api/checkin/records/{id}` - 删除打卡记录
- `DELETE /api/checkin/records` - 清空所有记录

### 统计相关
- `GET /api/checkin/stats` - 获取打卡统计
- `GET /api/checkin/today` - 检查今天是否已打卡

## 构建和部署

### 前端部署
1. 编译TypeScript：
```bash
npm run build
```

2. 在微信开发者工具中预览和调试

3. 上传代码到微信小程序平台

### 后端部署
1. 参考 `BACKEND_SETUP.md` 进行详细配置

2. 生产环境建议使用Docker部署：
```bash
cd backend
docker build -t checkin-backend .
docker run -p 8000:8000 checkin-backend
```

## 版本历史

- v1.0.0: 初始版本，支持基本的打卡功能
- v1.1.0: 转换为TypeScript，提升代码质量和开发体验
- v2.0.0: 重构为前后端分离架构，使用Python FastAPI后端

## 开发者

AI Assistant 
# 项目结构说明

## 📁 目录结构

```
wechat-mini-program/
├── app.ts                 # 应用入口文件 (TypeScript)
├── app.json              # 应用配置文件
├── app.wxss              # 应用样式文件
├── tsconfig.json         # TypeScript配置文件
├── package.json          # 项目依赖配置
├── docker-compose.yml    # Docker Compose配置
├── start.sh              # 一键启动脚本
├── DOCKER_SETUP.md       # Docker部署说明
├── PROJECT_STRUCTURE.md  # 项目结构说明
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
│   ├── init.sql          # 数据库初始化脚本
│   ├── Dockerfile        # Docker镜像配置
│   ├── .dockerignore     # Docker忽略文件
│   └── env.example       # 环境配置示例
├── logs/                 # 日志目录（运行时创建）
└── images/               # 图片资源
```

## 🏗️ 架构说明

### 前端架构
- **框架**: 微信小程序原生框架
- **语言**: TypeScript
- **状态管理**: 全局数据 + 本地存储
- **网络请求**: wx.request + 自定义API服务类

### 后端架构
- **框架**: FastAPI (Python)
- **数据库**: MySQL 8.0
- **ORM**: SQLAlchemy
- **认证**: JWT Token
- **API风格**: RESTful HTTP API

### 部署架构
- **容器化**: Docker + Docker Compose
- **数据库**: MySQL容器
- **后端服务**: Python FastAPI容器
- **网络**: 自定义Docker网络

## 🔧 技术栈

### 前端技术栈
- **TypeScript**: 类型安全的JavaScript超集
- **微信小程序**: 原生框架开发
- **模块化**: 清晰的代码结构和模块划分

### 后端技术栈
- **FastAPI**: 现代化的Python Web框架
- **MySQL**: 关系型数据库存储
- **JWT认证**: 安全的用户认证机制
- **RESTful API**: 标准的API设计

### 部署技术栈
- **Docker**: 容器化部署
- **Docker Compose**: 服务编排
- **MySQL**: 数据库服务
- **健康检查**: 服务状态监控

## 📊 服务端口

- **API服务**: http://localhost:8000
- **MySQL数据库**: localhost:3306

## 🚀 快速启动

```bash
# 启动所有服务
./start.sh

# 查看服务状态
./start.sh status

# 查看服务日志
./start.sh logs

# 停止所有服务
./start.sh stop
```

## 📝 开发说明

### 前端开发
1. 使用微信开发者工具打开项目
2. 确保TypeScript编译配置正确
3. 修改API地址为本地后端服务

### 后端开发
1. 进入backend目录
2. 安装Python依赖：`pip install -r requirements.txt`
3. 配置环境变量
4. 运行服务：`python run.py`

### Docker开发
1. 确保Docker和Docker Compose已安装
2. 运行 `./start.sh` 启动所有服务
3. 访问 http://localhost:8000/docs 查看API文档

## 🔍 关键文件说明

### 前端关键文件
- `app.ts`: 应用入口，全局数据管理
- `utils/api.ts`: API请求封装
- `types/index.d.ts`: TypeScript类型定义
- `pages/*/index.ts`: 各页面逻辑

### 后端关键文件
- `backend/app.py`: FastAPI应用主文件
- `backend/database.py`: 数据库连接配置
- `backend/models.py`: SQLAlchemy数据模型
- `backend/crud.py`: 数据库操作函数
- `backend/auth.py`: JWT认证模块

### 部署关键文件
- `docker-compose.yml`: 服务编排配置
- `backend/Dockerfile`: 后端容器配置
- `backend/init.sql`: 数据库初始化脚本
- `start.sh`: 一键启动脚本

## 📈 数据流

```
微信小程序 → API请求 → FastAPI后端 → MySQL数据库
     ↓              ↓              ↓
  本地存储 ← JWT认证 ← 数据验证 ← 数据查询
```

## 🔒 安全考虑

- JWT Token认证
- 数据库连接池
- 输入数据验证
- CORS跨域配置
- 错误处理机制

## 📞 支持

如有问题，请检查：
1. Docker环境是否正确安装
2. 端口是否被占用
3. 环境变量配置
4. 服务日志输出 